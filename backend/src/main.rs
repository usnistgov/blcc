use std::env;
use std::path::PathBuf;
use std::sync::Mutex;

use actix_cors::Cors;
use actix_files::{Files, NamedFile};
use actix_web::{App, HttpServer, middleware, Result, web};
use actix_web::middleware::Logger;
use diesel::{Connection, PgConnection};
use dotenvy::dotenv;
use env_logger;

use crate::api::config_api;

mod api;
mod models;
mod schema;

async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open(PathBuf::from("public/dist/index.html"))?)
}

struct AppState {
    db_connection: PgConnection,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().expect("No .env file found!");
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let db_connection = PgConnection::establish(&database_url).unwrap_or_else(|_| panic!("Error connecting to {}", database_url));

    HttpServer::new(move || {
        App::new()
            .app_data(Mutex::new(AppState { db_connection }))
            .wrap(Cors::default()
                .allowed_origin("https://blcctest.el.nist.gov")
                .allowed_methods(vec!["GET"])
            )
            .wrap(
                middleware::DefaultHeaders::new()
                    .add((
                        "Content-Security-Policy",
                        "default-src 'self' https://*.nist.gov; \
                        script-src 'self'; \
                        style-src 'self' 'unsafe-inline'; \
                        img-src 'self'; \
                        connect-src 'self' https://*.nist.gov; \
                        object-src 'none'; \
                        frame-ancestors 'none';"
                    ))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin"))
            )
            .wrap(Logger::default())
            .wrap(middleware::Compress::default())
            .configure(config_api)
            .service(
                Files::new("/", "./public/dist/")
                    .index_file("index.html")
            )
            .default_service(web::to(index))
    })
        .bind(("0.0.0.0", 8080))?
        .run()
        .await
}
