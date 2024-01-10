use actix_web::{get, Responder};
use actix_web::web::{Data, Json, scope, ServiceConfig};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper};
use serde::Deserialize;

use crate::DbPool;
use crate::models::*;
use crate::schema::zip_state::dsl::*;
use crate::schema::zip_state::zipcode;

#[derive(Deserialize)]
struct ZipStateRequest {
    zip: i32,
}

#[get("/zip-state")]
async fn get_state_from_zip(request: Json<ZipStateRequest>, data: Data<DbPool>) -> impl Responder {
    let zip = request.zip;
    let mut db = data.get().expect("Failed to get a connection");

    Json(
        zip_state
            .filter(zipcode.eq(zip))
            .limit(1)
            .select(ZipState::as_select())
            .first(&mut db)
            .expect(&*format!("Could not find state for zipcode {}", zip))
            .state
    )
}

pub fn config_api(config: &mut ServiceConfig) {
    config.service(
        scope("/api")
            .service(get_state_from_zip)
    );
}