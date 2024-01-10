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
    pub year: i32,
    pub rate: Option<f64>
}