use diesel::prelude::*;
use serde::Serialize;

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::state_division_region)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Division {
    pub state: String,
    pub division: String,
    pub region: String
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::scc)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Scc {
    pub year: i32,
    pub release_year: i32,
    pub three_percent_ninety_fifth_percentile: f64,
    pub five_percent_average: f64,
    pub three_percent_average: f64,
    pub two_and_a_half_percent_average: f64,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::zip_info)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ZipInfo {
    pub zip: i32,
    pub ba: String,
    pub gea: String,
    pub state: String,
    pub padd: String,
    pub technobasin: String,
    pub reeds_ba: Option<String>
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::region_case_ba)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RegionCaseBA {
    pub release_year: i32,
    pub year: i32,
    pub case: String,
    pub rate: String,
    pub ba: String,
    pub kg_co2_per_mwh: f64,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::escalation_rates)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct EscalationRate {
    pub release_year: i32,
    pub year: i32,
    pub division: String,
    pub sector: String,
    pub case: String,
    pub region: String,
    pub propane: Option<f64>,
    pub distillate_fuel_oil: Option<f64>,
    pub residual_fuel_oil: Option<f64>,
    pub natural_gas: Option<f64>,
    pub electricity: Option<f64>,
}
