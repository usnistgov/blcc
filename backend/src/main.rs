use std::path::PathBuf;

use actix_files::{Files, NamedFile};
use actix_web::{App, HttpServer, middleware, Result, web};
use actix_web::middleware::Logger;
use env_logger;

async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open(PathBuf::from("public/dist/index.html"))?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(middleware::Compress::default())
            .service(Files::new("/", "./public/dist/").show_files_listing())
            .default_service(web::to(index))
    })
        .bind(("0.0.0.0", 8080))?
        .run()
        .await
}
