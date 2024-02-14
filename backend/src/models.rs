use diesel::prelude::*;
use serde::Serialize;

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::zip_state)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ZipState {
    pub zipcode: i32,
    pub state: String
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
    pub electricity: Option<f64>
}