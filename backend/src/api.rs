use std::fmt::Display;

use actix_web::{get, HttpResponse, post, Responder};
use actix_web::web::{Data, Json, scope, ServiceConfig};
use diesel::{BoolExpressionMethods, ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper};
use diesel::dsl::{max, min};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::DbPool;
use crate::models::*;

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Deserialize)]
struct EscalationRateRequest {
    from: i32,
    to: i32,
    zip: i32,
    sector: String,
}

#[post("/escalation-rates")]
async fn post_escalation_rates(
    request: Json<EscalationRateRequest>,
    data: Data<DbPool>,
) -> impl Responder {
    use crate::schema::escalation_rates::dsl::escalation_rates;
    use crate::schema::escalation_rates::{division, sector, year};
    use crate::schema::state_division_region::dsl::state_division_region;
    use crate::schema::zip_info::dsl::zip_info;
    use crate::schema::zip_info::{state, zip};

    let from = request.from;
    let to = request.to;
    let mut db = data.get().expect("Failed to get a connection");

    let query = escalation_rates
        .inner_join(
            state_division_region.on(crate::schema::state_division_region::division.eq(division))
                .inner_join(zip_info.on(state.eq(crate::schema::state_division_region::state)))
        )
        .filter(
            year.between(from, to)
                .and(zip.eq(request.zip))
                .and(sector.eq(request.sector.clone()))
        )
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
struct RegionNatgasRequest {
    from: i32,
    to: i32,
    release_year: i32,
    technobasin: String,
    case: String,
    rate: String,
}

impl Display for RegionNatgasRequest{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "key: {} {} {} release year {} for years {} to {}",
            self.technobasin, self.case, self.rate, self.release_year, self.from, self.to
        )
    }
}

#[post("/region-natgas")]
async fn post_region_natgas(request: Json<RegionNatgasRequest>, data: Data<DbPool>) -> impl Responder {
    use crate::schema::region_natgas::dsl::*;
    use crate::schema::region_natgas::*;

    let mut db = data.get().expect("Failed to get a connection");

    let query: QueryResult<Vec<f64>> = region_natgas
        .filter(
            case.eq(request.case.clone())
                .and(technobasin.eq(request.technobasin.clone()))
                .and(release_year.eq(request.release_year))
                .and(rate.eq(request.rate.clone()))
                .and(year.between(request.from, request.to)),
        )
        .select(kg_co2_per_mj)
        .load(&mut db);

    match query {
        Ok(emissions) => HttpResponse::Ok().json(emissions),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get region natgas information for {}", request),
        }),
    }
}

#[derive(Deserialize)]
struct RegionCasePropaneLNGRequest {
    from: i32,
    to: i32,
    release_year: i32,
    padd: String,
    case: String,
    rate: String,
}

impl Display for RegionCasePropaneLNGRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "key: {} {} {} release year {} for years {} to {}",
            self.padd, self.case, self.rate, self.release_year, self.from, self.to
        )
    }
}

#[post("/region-case-propane-lng")]
async fn post_region_case_propane_lng(request: Json<RegionCasePropaneLNGRequest>, data: Data<DbPool>) -> impl Responder {
    use crate::schema::region_case_propane_lng::dsl::*;
    use crate::schema::region_case_propane_lng::*;

    let mut db = data.get().expect("Failed to get a connection");

    let query: QueryResult<Vec<f64>> = region_case_propane_lng
        .filter(
            case.eq(request.case.clone())
                .and(padd.eq(request.padd.clone()))
                .and(release_year.eq(request.release_year))
                .and(rate.eq(request.rate.clone()))
                .and(year.between(request.from, request.to)),
        )
        .select(kg_co2_per_mj)
        .load(&mut db);

    match query {
        Ok(emissions) => HttpResponse::Ok().json(emissions),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get region case propane lng information for {}", request),
        }),
    }
}

#[derive(Deserialize)]
struct RegionOilRequest {
    from: i32,
    to: i32,
    release_year: i32,
    padd: String,
    case: String,
    rate: String,
}

impl Display for RegionOilRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "key: {} {} {} release year {} for years {} to {}",
            self.padd, self.case, self.rate, self.release_year, self.from, self.to
        )
    }
}

#[post("/region-case-oil")]
async fn post_region_case_oil(request: Json<RegionOilRequest>, data: Data<DbPool>) -> impl Responder {
    use crate::schema::region_case_oil::dsl::*;
    use crate::schema::region_case_oil::*;

    let mut db = data.get().expect("Failed to get a connection");

    let query: QueryResult<Vec<f64>> = region_case_oil
        .filter(
            case.eq(request.case.clone())
                .and(padd.eq(request.padd.clone()))
                .and(release_year.eq(request.release_year))
                .and(rate.eq(request.rate.clone()))
                .and(year.between(request.from, request.to)),
        )
        .select(kg_co2_per_mj)
        .load(&mut db);

    match query {
        Ok(emissions) => HttpResponse::Ok().json(emissions),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get region case oil information for {}", request),
        }),
    }
}

#[derive(Deserialize)]
struct RegionCaseReedsRequest {
    from: i32,
    to: i32,
    release_year: i32,
    reeds: String,
    case: String,
    rate: String,
}

impl Display for RegionCaseReedsRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "key: {} {} {} release year {} for years {} to {}",
            self.reeds, self.case, self.rate, self.release_year, self.from, self.to
        )
    }
}

#[post("/region-case-reeds")]
async fn post_region_case_reeds(request: Json<RegionCaseReedsRequest>, data: Data<DbPool>) -> impl Responder {
    use crate::schema::region_case_reeds::dsl::*;
    use crate::schema::region_case_reeds::*;

    let mut db = data.get().expect("Failed to get a connection");

    let query: QueryResult<Vec<f64>> = region_case_reeds
        .filter(
            case.eq(request.case.clone())
                .and(reeds.eq(request.reeds.clone()))
                .and(release_year.eq(request.release_year))
                .and(rate.eq(request.rate.clone()))
                .and(year.between(request.from, request.to)),
        )
        .select(kg_co2_per_mwh)
        .load(&mut db);

    match query {
        Ok(emissions) => HttpResponse::Ok().json(emissions),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get region case reeds information for {}", request),
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
        }
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

#[derive(Serialize)]
struct ReleaseYearResponse {
    pub year: i32,
    pub max: Option<i32>,
    pub min: Option<i32>,
}

#[get("/release_year")]
async fn get_release_years(data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    let query: QueryResult<Vec<(i32, Option<i32>, Option<i32>)>> = region_case_ba
        .group_by(release_year)
        .select((release_year, max(year), min(year)))
        .load(&mut db);

    match query {
        Ok(years) => HttpResponse::Ok().json(
            years.iter()
                .map(|t| ReleaseYearResponse { year: t.0, max: t.1, min: t.2 })
                .collect::<Vec<ReleaseYearResponse>>()
        ),
        Err(err) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get release years {}", err),
        }),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum SccOption {
    ThreePercentNinetyFifthPercentile,
    FivePercentAverage,
    ThreePercentAverage,
    TwoAndAHalfPercentAverage,
}

#[derive(Deserialize)]
struct SccRequest {
    from: i32,
    to: i32,
    release_year: i32,
    option: SccOption,
}

#[post("/scc")]
async fn post_scc(request: Json<SccRequest>, data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::scc::dsl::*;
    use crate::schema::scc::*;

    let query: QueryResult<Vec<f64>> = match request.option {
        SccOption::ThreePercentNinetyFifthPercentile => {
            scc
                .filter(
                    release_year.eq(request.release_year)
                        .and(year.between(request.from, request.to))
                )
                .select(three_percent_ninety_fifth_percentile)
                .load(&mut db)
        }
        SccOption::FivePercentAverage => {
            scc
                .filter(
                    release_year.eq(request.release_year)
                        .and(year.between(request.from, request.to))
                )
                .select(five_percent_average)
                .load(&mut db)
        }
        SccOption::ThreePercentAverage => {
            scc
                .filter(
                    release_year.eq(request.release_year)
                        .and(year.between(request.from, request.to))
                )
                .select(three_percent_average)
                .load(&mut db)
        }
        SccOption::TwoAndAHalfPercentAverage => {
            scc
                .filter(
                    release_year.eq(request.release_year)
                        .and(year.between(request.from, request.to))
                )
                .select(two_and_a_half_percent_average)
                .load(&mut db)
        }
    };

    match query {
        Ok(values) => HttpResponse::Ok().json(values),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get scc".to_string(),
        }),
    }
}

#[get("/states")]
async fn get_states(data: Data<DbPool>) -> impl Responder {
    let mut db = data.get().expect("Failed to get a connection");

    use crate::schema::state_division_region::dsl::*;
    use crate::schema::state_division_region::*;

    let query: QueryResult<Vec<String>> = state_division_region.select(state).load(&mut db);

    match query {
        Ok(values) => HttpResponse::Ok().json(values),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get states".to_string()
        })
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
            .service(post_scc)
            .service(get_states)
            .service(post_region_natgas)
            .service(post_region_case_oil)
            .service(post_region_case_propane_lng)
            .service(post_region_case_reeds)
    );
}
