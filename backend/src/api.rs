use actix_web::web::{scope, Data, Json, ServiceConfig};
use actix_web::{get, HttpResponse, post, Responder};
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

#[post("/escalation-rates")]
async fn post_escalation_rates(
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

#[post("/region-case-ba")]
async fn post_region_case_ba(
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

#[post("/zip_info")]
async fn post_zip_info(request: Json<ZipInfoRequest>, data: Data<DbPool>) -> impl Responder {
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

#[post("/emissions")]
async fn post_emissions(request: Json<EmissionsRequest>, data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::zip_info::dsl::*;
    use crate::schema::zip_info::*;

    let info_db = zip_info.filter(zip.eq(request.zip))
        .select(ZipInfo::as_select())
        .first(&mut db);

    match info_db {
        Ok(info) => {
            use crate::schema::region_case_ba::dsl::*;
            use crate::schema::region_case_ba::*;

            let query: QueryResult<Vec<f64>> = region_case_ba
                .filter(
                    case.eq(request.case.clone())
                        .and(ba.eq(info.ba.clone()))
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
        },
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get emissions zip information for {}", request),
        }),
    }
}

#[derive(Deserialize)]
struct ReleaseYearRequest {
    year: i32,
}

#[post("/release_year")]
async fn post_check_release_year_exists(request: Json<ReleaseYearRequest>, data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    let query: QueryResult<i32> = region_case_ba
        .filter(release_year.eq(request.year))
        .select(release_year)
        .first(&mut db);

    match query {
        Ok(_) => HttpResponse::Ok().json(true),
        Err(_) => HttpResponse::Ok().json(false),
    }
}

#[get("/release_year")]
async fn get_release_years(data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    let query: QueryResult<Vec<i32>> = region_case_ba
        .limit(100)
        .order(release_year.desc())
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

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(post_escalation_rates)
            .service(post_region_case_ba)
            .service(post_zip_info)
            .service(post_emissions)
            .service(get_release_years)
            .service(post_check_release_year_exists)
    );
}
