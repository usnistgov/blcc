use std::env;

use actix_web::web::{scope, Data, Json, ServiceConfig};
use actix_web::{get, post, HttpResponse, Responder};
use diesel::dsl::{max, min};
use diesel::prelude::*;
use diesel::{BoolExpressionMethods, ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper};
use serde::{Deserialize, Serialize};

use crate::models::*;
use crate::schema::escalation_rates::release_year;
use crate::AppData;

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Deserialize, Clone)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
struct EscalationRateRequest {
    from: i32,
    to: i32,
    zip: i32,
    sector: Option<String>,
    release_year: i32,
    case: String,
}

#[post("/escalation_rates")]
async fn post_escalation_rates(
    request: Json<EscalationRateRequest>,
    data: Data<AppData>,
) -> impl Responder {
    use crate::schema::escalation_rates::dsl::escalation_rates;
    use crate::schema::escalation_rates::{division, sector, year, case};
    use crate::schema::state_division_region::dsl::state_division_region;
    use crate::schema::zip_info::dsl::zip_info;
    use crate::schema::zip_info::{state, zip};

    let from = request.from;
    let to = request.to;
    let mut db = data.pool.get().expect("Failed to get a connection");

    let mut query = escalation_rates
        .into_boxed()
        .inner_join(
            state_division_region.on(crate::schema::state_division_region::division.eq(division))
                .inner_join(zip_info.on(state.eq(crate::schema::state_division_region::state)))
        )
        .filter(
            year.between(from, to)
                .and(release_year.eq(request.release_year))
                .and(zip.eq(request.zip))
                .and(case.eq(request.case.clone()))
        );

    let sector_option = request.clone().sector;
    if let Some(some_sector) = sector_option {
        query = query.filter(sector.eq(some_sector.clone()));
    }

    let result = query
        .limit(80)
        .select(EscalationRate::as_select())
        .load(&mut db);

    match result {
        Ok(rates) => HttpResponse::Ok().json(rates),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: format!("Could not get escalation rates from {} to {}", from, to),
        }),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RegionCaseBARequest {
    from: i32,
    to: i32,
    release_year: i32,
    ba: String,
    case: String,
    rate: String,
}

#[post("/region_case_ba")]
async fn post_region_case_ba(
    request: Json<RegionCaseBARequest>,
    data: Data<AppData>,
) -> impl Responder {
    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    let mut db = data.pool.get().expect("Failed to get a connection");

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
            error: "Could not get emissions information".into(),
        }),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RegionNatgasRequest {
    from: i32,
    to: i32,
    release_year: i32,
    technobasin: String,
    case: String,
    rate: String,
}

#[post("/region_natgas")]
async fn post_region_natgas(request: Json<RegionNatgasRequest>, data: Data<AppData>) -> impl Responder {
    use crate::schema::region_natgas::dsl::*;
    use crate::schema::region_natgas::*;

    let mut db = data.pool.get().expect("Failed to get a connection");

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
            error: "Could not get region natgas information".into(),
        }),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RegionCasePropaneLNGRequest {
    from: i32,
    to: i32,
    release_year: i32,
    padd: String,
    case: String,
    rate: String,
}

#[post("/region_case_propane_lng")]
async fn post_region_case_propane_lng(request: Json<RegionCasePropaneLNGRequest>, data: Data<AppData>) -> impl Responder {
    use crate::schema::region_case_propane_lng::dsl::*;
    use crate::schema::region_case_propane_lng::*;

    let mut db = data.pool.get().expect("Failed to get a connection");

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
            error: "Could not get region case propane lng information".into(),
        }),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RegionOilRequest {
    from: i32,
    to: i32,
    release_year: i32,
    padd: String,
    case: String,
    rate: String,
}

#[post("/region_case_oil")]
async fn post_region_case_oil(request: Json<RegionOilRequest>, data: Data<AppData>) -> impl Responder {
    use crate::schema::region_case_oil::dsl::*;
    use crate::schema::region_case_oil::*;

    let mut db = data.pool.get().expect("Failed to get a connection");

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
            error: "Could not get region case oil information".into(),
        }),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RegionCaseReedsRequest {
    from: i32,
    to: i32,
    release_year: i32,
    reeds: String,
    case: String,
    rate: String,
}

#[post("/region_case_reeds")]
async fn post_region_case_reeds(request: Json<RegionCaseReedsRequest>, data: Data<AppData>) -> impl Responder {
    use crate::schema::region_case_reeds::dsl::*;
    use crate::schema::region_case_reeds::*;

    let mut db = data.pool.get().expect("Failed to get a connection");

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
            error: "Could not get region case reeds information".into(),
        }),
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ZipInfoRequest {
    zip: i32,
}

#[post("/zip_info")]
async fn post_zip_info(request: Json<ZipInfoRequest>, data: Data<AppData>) -> impl Responder {
    use crate::schema::zip_info::dsl::*;
    use crate::schema::zip_info::*;

    let mut db = data.pool.get().expect("Failed to get a connection");

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
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct EmissionsRequest {
    zip: i32,
    from: i32,
    to: i32,
    release_year: i32,
    case: String,
    rate: String,
}

#[post("/emissions")]
async fn post_emissions(request: Json<EmissionsRequest>, data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

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
                    error: "Could not get requested emissions information".into(),
                }),
            }
        }
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get requested emissions zip information".into(),
        }),
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ReleaseYearRequest {
    year: i32,
}

#[post("/release_year")]
async fn post_check_release_year_exists(request: Json<ReleaseYearRequest>, data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

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

type RegionCaseResult = QueryResult<Vec<(i32, Option<i32>, Option<i32>)>>;

#[get("/release_year")]
async fn get_release_years(data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

    use crate::schema::region_case_ba::dsl::*;
    use crate::schema::region_case_ba::*;

    let query: RegionCaseResult = region_case_ba
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
#[serde(rename_all = "camelCase", deny_unknown_fields)]
enum SccOption {
    ThreePercentNinetyFifthPercentile,
    FivePercentAverage,
    ThreePercentAverage,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct SccRequest {
    from: i32,
    to: i32,
    release_year: i32,
    option: SccOption,
}

#[post("/scc")]
async fn post_scc(request: Json<SccRequest>, data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

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
    };

    match query {
        Ok(values) => HttpResponse::Ok().json(values),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get scc".to_string(),
        }),
    }
}

#[get("/states")]
async fn get_states(data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

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

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
enum EnergyTypeOptions {
    DistillateFuelOil,
    ResidualFuelOil,
    NaturalGas,
    Electricity,
    Propane,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct EnergyPriceRequest {
    from: i32,
    to: i32,
    release_year: i32,
    division: String,
    sector: String,
    fuel_type: EnergyTypeOptions,
    case: String,
}

#[post("/energy_prices")]
async fn post_energy_prices(request: Json<EnergyPriceRequest>, data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

    use crate::schema::energy_prices::dsl::*;
    use crate::schema::energy_prices::*;

    let query = energy_prices
        .filter(
            release_year.eq(request.release_year)
                .and(year.between(request.from, request.to))
                .and(division.eq(request.division.clone()))
                .and(case.eq(request.case.clone()))
                .and(sector.eq(request.sector.clone()))
        );

    let result: QueryResult<Vec<Option<f64>>> = match request.fuel_type.clone() {
        EnergyTypeOptions::DistillateFuelOil => query.select(distillate_fuel_oil).load(&mut db),
        EnergyTypeOptions::ResidualFuelOil => query.select(residual_fuel_oil).load(&mut db),
        EnergyTypeOptions::NaturalGas => query.select(natural_gas).load(&mut db),
        EnergyTypeOptions::Electricity => query.select(electricity).load(&mut db),
        EnergyTypeOptions::Propane => query.select(propane).load(&mut db)
    };

    match result {
        Ok(values) => HttpResponse::Ok().json(values),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get energy prices".to_string()
        })
    }
}

#[post("/energy_price_indices")]
async fn post_energy_price_indices(request: Json<EnergyPriceRequest>, data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

    use crate::schema::energy_price_indices::dsl::*;
    use crate::schema::energy_price_indices::*;

    let query = energy_price_indices
        .filter(
            release_year.eq(request.release_year)
                .and(year.between(request.from, request.to))
                .and(division.eq(request.division.clone()))
                .and(case.eq(request.case.clone()))
                .and(sector.eq(request.sector.clone()))
        );

    let result: QueryResult<Vec<Option<f64>>> = match request.fuel_type.clone() {
        EnergyTypeOptions::DistillateFuelOil => query.select(distillate_fuel_oil).load(&mut db),
        EnergyTypeOptions::ResidualFuelOil => query.select(residual_fuel_oil).load(&mut db),
        EnergyTypeOptions::NaturalGas => query.select(natural_gas).load(&mut db),
        EnergyTypeOptions::Electricity => query.select(electricity).load(&mut db),
        EnergyTypeOptions::Propane => query.select(propane).load(&mut db)
    };

    match result {
        Ok(values) => HttpResponse::Ok().json(values),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get energy price indices".to_string()
        })
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct DiscountRateRequest {
    release_year: i32,
    rate: String,
}

#[post("/discount_rates")]
async fn post_discount_rates(request: Json<DiscountRateRequest>, data: Data<AppData>) -> impl Responder {
    let mut db = data.pool.get().expect("Failed to get a connection");

    use crate::schema::discount_rates::dsl::*;
    use crate::schema::discount_rates::*;

    let result = discount_rates
        .filter(
            release_year.eq(request.release_year)
                .and(rate.eq(request.rate.clone()))
        )
        .order_by(year)
        .select(DiscountRates::as_select())
        .load(&mut db);

    match result {
        Ok(rates) => HttpResponse::Ok().json(rates),
        Err(_) => HttpResponse::BadRequest().json(ErrorResponse {
            error: "Could not get discount rates".to_string()
        })
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct E3Request {
    request: String,
}

#[post("/e3_request")]
async fn post_e3_request(request: Json<E3Request>, data: Data<AppData>) -> impl Responder {
    let e3_request = request.request.clone();

    let response = data.client
        .post(env::var("E3_URL").expect("E3 URL not set"))
        .header("Authorization", format!("Api-Key: {}", env::var("E3_API_KEY").expect("E3 API KEY not set")))
        .body(e3_request)
        .send()
        .await
        .expect("Request failed")
        .text()
        .await
        .expect("Could not parse E3 response");

    HttpResponse::Ok().body(response)
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
            .service(post_energy_prices)
            .service(post_energy_price_indices)
            .service(post_discount_rates)
            .service(post_e3_request)
    );
}
