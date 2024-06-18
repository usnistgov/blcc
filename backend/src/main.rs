extern crate diesel;
extern crate diesel_migrations; // Openssl declaration must be first
extern crate openssl;

use std::env;

use actix_cors::Cors;
use actix_files::Files;
use actix_web::{App, HttpServer, middleware};
use actix_web::middleware::Logger;
use actix_web::web::Data;
use diesel::pg::Pg;
use diesel::PgConnection;
use diesel::r2d2::ConnectionManager;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use env_logger;
use r2d2::Pool;

use crate::api::config_api;
use crate::paginated::config_paginated;

mod api;
mod models;
mod schema;
mod paginated;

type DbPool = Pool<ConnectionManager<PgConnection>>;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

fn run_migrations(connection: &mut impl MigrationHarness<Pg>) {
    connection
        .run_pending_migrations(MIGRATIONS)
        .expect("Could not run migrations");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Get environment variable and logger
    dotenv().expect("No .env file found!");
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // Setup database pool
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = Pool::builder()
        .build(manager)
        .expect("Failed to create pool");

    // Check if migrations need to be run
    let mut connection = pool
        .get()
        .expect("Could not get postgres connection for migrations.");
    run_migrations(&mut connection);

    let public_folder = env::var("PUBLIC_FOLDER")
        .unwrap_or_else(|_| { "public/" }.parse().unwrap());

    HttpServer::new(move || {
        // Set up cors middleware
        let cors = env::var("ALLOWED_ORIGIN")
            .unwrap_or_else(|_| { "https://localhost:8080" }.parse().unwrap())
            .split(",")
            .fold(
                Cors::default().allowed_methods(vec!["GET", "POST"]),
                |cors, origin| cors.allowed_origin(&*origin)
            );

        App::new()
            .app_data(Data::new(pool.clone()))
            .wrap(cors)
            .wrap(
                middleware::DefaultHeaders::new()
                    .add((
                        "Content-Security-Policy",
                        "default-src 'self' https://*.nist.gov; \
                        script-src 'self'; \
                        style-src 'self' 'unsafe-inline'; \
                        img-src 'self' https://pages.nist.gov; \
                        connect-src 'self' https://*.nist.gov; \
                        object-src 'none'; \
                        frame-ancestors 'none';",
                    ))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin")),
            )
            .wrap(Logger::default())
            .wrap(middleware::Compress::default())
            .configure(config_api)
            .configure(config_paginated)
            .default_service(Files::new("/", public_folder.clone()).index_file("index.html"))
    })
        .bind(("0.0.0.0", 8080))?
        .run()
        .await
}
