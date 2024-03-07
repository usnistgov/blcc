use actix_web::web::{scope, Data, Json, ServiceConfig};
use actix_web::{get, HttpResponse, Responder};
use diesel::prelude::*;
use diesel::{BoolExpressionMethods, ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper};
use serde::{Deserialize, Serialize};

use std::fmt::Display;

use crate::models::*;
use crate::schema::zip_state::dsl::*;
use crate::schema::zip_state::zipcode;
use crate::DbPool;

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Deserialize)]
struct ZipStateRequest {
    zipcode: i32,
}

#[get("/zip-state")]
async fn get_state_from_zip(request: Json<ZipStateRequest>, data: Data<DbPool>) -> impl Responder {
    let zip = request.zipcode;
    let mut db = data.get().expect("Failed to get a connection");

    let query = zip_state
        .filter(zipcode.eq(zip))
        .limit(1)
        .select(ZipState::as_select())
        .first(&mut db);

    match query {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not find state for zipcode {}", zip),
        }),
    }
}

#[derive(Deserialize)]
struct EscalationRateRequest {
    from: i32,
    to: i32,
}

#[get("/escalation-rates")]
async fn get_escalation_rates(
    request: Json<EscalationRateRequest>,
    data: Data<DbPool>,
) -> impl Responder {
    use crate::schema::escalation_rates::dsl::*;
    use crate::schema::escalation_rates::*;

    let from = request.from;
    let to = request.to;
    let mut db = data.get().expect("Failed to get a connection");

    let query = escalation_rates
        .filter(year.between(from, to))
        .limit(80)
        .select(EscalationRate::as_select())
        .load(&mut db);

    match query {
        Ok(rates) => HttpResponse::Ok().json(rates),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get escalation rates from {} to {}", from, to),
        }),
    }
}

#[derive(Deserialize)]
struct RegionCaseBARequest {
    from: i32,
    to: i32,
    release_year: i32,
    ba: String,
    case: String,
    rate: String,
}

impl Display for RegionCaseBARequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "key: {} {} {} release year {} for years {} to {}",
            self.ba, self.case, self.rate, self.release_year, self.from, self.to
        )
    }
}

#[get("/region-case-ba")]
async fn get_region_case_ba(
    request: Json<RegionCaseBARequest>,
    data: Data<DbPool>,
) -> impl Responder {
    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    let mut db = data.get().expect("Failed to get a connection");

    let query: QueryResult<Vec<f64>> = region_case_ba
        .filter(
            case.eq(request.case.clone())
                .and(ba.eq(request.ba.clone()))
                .and(release_year.eq(request.release_year))
                .and(rate.eq(request.rate.clone()))
                .and(year.between(request.from, request.to)),
        )
        .select(kg_co2_per_mwh)
        .load(&mut db);

    match query {
        Ok(emissions) => HttpResponse::Ok().json(emissions),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get emissions information for {}", request),
        }),
    }
}

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(get_state_from_zip)
            .service(get_escalation_rates)
            .service(get_region_case_ba),
    );
}
