use std::path::PathBuf;

use actix_files::{Files, NamedFile};
use actix_web::{App, get, HttpServer, middleware, Result};

#[get("/")]
async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open(PathBuf::from("public/index.html"))?)
}

#[get("/application")]
async fn application() -> Result<NamedFile> {
    Ok(NamedFile::open(PathBuf::from("public/dist/index.html"))?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::default())
            .service(index)
            .service(application)
            .service(Files::new("/", "./public/dist/").show_files_listing())
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
