use actix_web::{get, HttpResponse, Responder};
use actix_web::web::{Data, Json, scope, ServiceConfig};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper};
use serde::{Deserialize, Serialize};

use crate::DbPool;
use crate::models::*;
use crate::schema::escalation_rates::dsl::*;
use crate::schema::escalation_rates::year;
use crate::schema::zip_state::dsl::*;
use crate::schema::zip_state::zipcode;

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
        Ok(result) => { HttpResponse::Ok().json(result) }
        Err(_) => { HttpResponse::BadRequest().json(ErrorResponse { error: format!("Could not find state for zipcode {}", zip) }) }
    }
}

#[derive(Deserialize)]
struct EscalationRateRequest {
    from: i32,
    to: i32,
}

#[get("/escalation-rates")]
async fn get_escalation_rates(request: Json<EscalationRateRequest>, data: Data<DbPool>) -> impl Responder {
    let from = request.from;
    let to = request.to;
    let mut db = data.get().expect("Failed to get a connection");

    let query = escalation_rates
        .filter(year.between(from, to))
        .limit(80)
        .select(EscalationRate::as_select())
        .load(&mut db);

    match query {
        Ok(rates) => { HttpResponse::Ok().json(rates) }
        Err(_) => { HttpResponse::BadRequest().json(ErrorResponse { error: format!("Could get escalation rates from {} to {}", from, to) }) }
    }
}

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(get_state_from_zip)
            .service(get_escalation_rates)
    );
}