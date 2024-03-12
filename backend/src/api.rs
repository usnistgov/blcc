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

#[derive(Deserialize)]
struct EmissionsRequest {
    zip: i32,
    from: i32,
    to: i32,
    release_year: i32,
    case: String,
    rate: String,
}

impl Display for EmissionsRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "key: {} {} {} release year {} for years {} to {}",
            self.zip, self.case, self.rate, self.release_year, self.from, self.to
        )
    }
}

#[get("/emissions")]
async fn get_emissions(request: Json<EmissionsRequest>, data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::zip_info::dsl::*;
    use crate::schema::zip_info::*;

    let info = zip_info.filter(zip.eq(request.zip))
        .select(ZipInfo::as_select())
        .first(&mut db)
        .unwrap();

    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;
    use crate::schema::region_case_ba;

    let query: QueryResult<Vec<f64>> = region_case_ba
        .filter(
            case.eq(request.case.clone())
                .and(region_case_ba::ba.eq(info.ba.clone()))
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
struct ReleaseYearRequest {
    year: i32,
}

#[get("/release_year")]
async fn get_release_year(request: Option<Json<ReleaseYearRequest>>, data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    match request {
        Some(req) => {
            let query: QueryResult<i32> = region_case_ba
                .filter(release_year.eq(req.year))
                .select(release_year)
                .first(&mut db);

            match query {
                Ok(_) => HttpResponse::Ok().json(true),
                Err(_) => HttpResponse::Ok().json(false),
            }
        }
        None => {
            let query: QueryResult<Vec<i32>> = region_case_ba
                .distinct()
                .select(release_year)
                .load(&mut db);

            match query {
                Ok(years) => HttpResponse::Ok().json(years),
                Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
                    error: format!("Could not get release years"),
                }),
            }
        }
    }
}

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(get_escalation_rates)
            .service(get_region_case_ba)
            .service(get_zip_info)
            .service(get_emissions)
            .service(get_release_year)
    );
}
