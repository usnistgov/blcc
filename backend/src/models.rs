use diesel::prelude::*;
use serde::Serialize;

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::discount_rates)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct DiscountRates {
    pub release_year: i32,
    pub rate: String,
    pub year: i32,
    pub real: f64,
    pub nominal: f64,
    pub inflation: f64
}

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
    pub coal: Option<f64>,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::region_case_oil)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RegionCaseOil {
    pub release_year: i32,
    pub year: i32,
    pub case: String,
    pub rate: String,
    pub padd: String,
    pub kg_co2_per_mj: f64,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::region_case_propane_lng)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RegionCasePropaneLNG {
    pub release_year: i32,
    pub year: i32,
    pub case: String,
    pub rate: String,
    pub padd: String,
    pub kg_co2_per_mj: f64,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::region_case_reeds)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RegionCaseReeds {
    pub release_year: i32,
    pub year: i32,
    pub case: String,
    pub rate: String,
    pub reeds: String,
    pub kg_co2_per_mwh: f64,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::region_natgas)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RegionCaseNatgas {
    pub release_year: i32,
    pub year: i32,
    pub technobasin: String,
    pub case: String,
    pub rate: String,
    pub kg_co2_per_mj: f64,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::energy_prices)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct EnergyPrices {
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
    pub coal: Option<f64>,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::energy_price_indices)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct EnergyPriceIndices {
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
    pub coal: Option<f64>,
}