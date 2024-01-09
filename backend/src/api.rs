use std::sync::Mutex;
use actix_web::{get, Responder};
use actix_web::web::{Data, Json, scope, ServiceConfig};
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl, SelectableHelper};
use serde::Deserialize;
use diesel::prelude::*;
use crate::AppState;

use crate::models::*;
use crate::schema::zip_state::dsl::*;
use crate::schema::zip_state::zipcode;

#[get("/test")]
async fn test_handler() -> impl Responder {
    Json("Hello, World!")
}

#[derive(Deserialize)]
struct ZipStateRequest {
    zip: i32,
}

#[get("/zip-state")]
async fn get_state_from_zip(request: Json<ZipStateRequest>, data: Data<Mutex<AppState>>) -> impl Responder {
    let zip = request.zip;
    let mut db = data.lock().unwrap();

    zip_state
        .filter(zipcode.eq(zip))
        .limit(1)
        .select(ZipState::as_select())
        .load(&mut db.db_connection)
        .expect(&*format!("Could not find state for zipcode {}", zip))
        .first()
        .unwrap()
        .state
}

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(test_handler)
            .service(get_state_from_zip)
    );
}