use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::zip_state)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ZipState {
    pub zipcode: i32,
    pub state: String
}