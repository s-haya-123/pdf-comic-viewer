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
#[get("/list")]
pub fn pdf_list() -> Json<Vec<Comic>> {
    use schema::comic::dsl::*;
    let connection = establish_connection();
    let results = comic
    .load::<Comic>(&connection)
    .expect("Error loading posts");
    Json(results)
}
#[get("/<id>")]
fn get_pdf(id: String) -> Option<NamedFile> {
    NamedFile::open(Path::new(&format!("assets/pdf/{}.pdf", id))).ok()
}
#[get("/<id>")]
fn get_img(id: String) -> Option<NamedFile> {
    NamedFile::open(Path::new(&format!("assets/img/{}.jpg", id))).ok()
}
fn rocket() -> rocket::Rocket {
    rocket::ignite()
    .mount("/", routes![index])
    .mount("/pdf", routes![pdf_list, get_pdf])
    .mount("/thumbnail", routes![get_img])
}
fn main() {
    rocket().launch();
}