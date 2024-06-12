use std::ops::Add;

use actix_web::{HttpResponse, post, Responder};
use actix_web::web::{Data, Json, scope, ServiceConfig};
use diesel::{QueryDsl, QueryResult, RunQueryDsl, TextExpressionMethods};
use diesel::dsl::sql;
use diesel::sql_types::{Bool, Text};
use serde::{Deserialize, Serialize};

use crate::api::ErrorResponse;
use crate::DbPool;

const PAGE_LIMIT: i64 = 100;

#[derive(Serialize)]
pub struct Paginated<T> {
    values: Vec<T>,
    page: i64,
    has_next: bool,
}

#[derive(Deserialize)]
struct ZipcodeRequest {
    partial_zip: Option<String>,
    state: Option<String>,
    page: Option<i64>,
}

#[post("/zipcodes")]
async fn post_zipcodes(request: Json<ZipcodeRequest>, data: Data<DbPool>) -> impl Responder {
    use crate::schema::zip_info::dsl::zip_info;
    use crate::schema::zip_info::*;

    let mut db = data.get().expect("Failed to get db connection");

    let mut query = zip_info.into_boxed();
    let mut next_query = zip_info.into_boxed();

    // Apply state filter if we have it
    if let Some(state_abbreviation) = request.state.clone() {
        query = query.filter(state.like(state_abbreviation.clone()));
        next_query = next_query.filter(state.like(state_abbreviation));
    }

    // Apply partial zipcode filter if we have it
    if let Some(partial_zip) = request.partial_zip.clone() {
        let pattern = partial_zip.add("%");

        query = query.filter(sql::<Bool>("zip::text LIKE ").bind::<Text, _>(pattern.clone()));
        next_query = next_query.filter(sql::<Bool>("zip::text LIKE ").bind::<Text, _>(pattern));
    }

    // Get the page to load or default to the first (0 index) page
    let page = request.page.unwrap_or(0);

    // Get the results
    let result: QueryResult<Vec<i32>> = query
        .limit(PAGE_LIMIT)
        .offset(page * PAGE_LIMIT)
        .select(zip)
        .load(&mut db);

    // Test if the next page exists
    let next_result: QueryResult<Vec<i32>> = next_query
        .limit(1)
        .offset((page + 1) * PAGE_LIMIT)
        .select(zip)
        .load(&mut db);

    let has_next = match next_result {
        Ok(result) => !result.is_empty(),
        Err(_) => false
    };

    match result {
        Ok(zipcodes) => HttpResponse::Ok().json(Paginated {
            values: zipcodes,
            page,
            has_next,
        }),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not find zipcodes".to_string()
        })
    }
}

pub fn config_paginated(config: &mut ServiceConfig) {
    config.service(
        scope("/paginated")
            .service(post_zipcodes)
    );
}