#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

#[macro_use] extern crate diesel;
mod models;

use backend::*;
use models::*;
use std::path::Path;
use diesel::prelude::*;
use rocket_contrib::json::Json;
use rocket::response::NamedFile;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}
#[get("/pdf")]
pub fn pdf() -> Json<Vec<Comic>> {
    use schema::comic::dsl::*;
    let connection = establish_connection();
    let results = comic
    .load::<Comic>(&connection)
    .expect("Error loading posts");
    Json(results)
}
#[get("/<id>")]
pub fn get_pdf(id: String) -> Option<NamedFile> {
    NamedFile::open(Path::new("assets/sample.pdf")).ok()
}
fn main() {
    rocket::ignite().mount("/", routes![index, pdf, get_pdf]).launch();
}