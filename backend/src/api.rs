use actix_web::web::{scope, Data, Json, ServiceConfig};
use actix_web::{get, HttpResponse, Responder};
use diesel::prelude::*;
use diesel::{BoolExpressionMethods, ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper};
use serde::{Deserialize, Serialize};

use std::fmt::Display;

use crate::models::*;
use crate::DbPool;

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
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

#[derive(Deserialize)]
struct ZipInfoRequest {
    zip: i32,
}

#[get("/zip_info")]
async fn get_zip_info(request: Json<ZipInfoRequest>, data: Data<DbPool>) -> impl Responder {
    use crate::schema::zip_info::dsl::*;
    use crate::schema::zip_info::*;

    let mut db = data.get().expect("Failed to get a connection");

    let query = zip_info.filter(zip.eq(request.zip))
        .select(ZipInfo::as_select())
        .load(&mut db);

    match query {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(err) => {
            println!("{}", err);
            HttpResponse::BadRequest().json(ErrorResponse {
                error: format!("Could not get region for zipcode {}", request.zip),
            })
        }
    }
}

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(get_escalation_rates)
            .service(get_region_case_ba)
            .service(get_zip_info)
    );
}
