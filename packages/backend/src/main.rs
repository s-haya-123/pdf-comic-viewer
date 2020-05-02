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
use uuid::Uuid;
extern crate rocket_cors;

use rocket::http::Method;
use rocket_cors::{
    AllowedHeaders, AllowedOrigins, Error,
    Cors, CorsOptions
};

fn make_cors() -> Cors {
    let allowed_origins = AllowedOrigins::some_exact(&[
        "http://localhost:3000",
    ]);

    CorsOptions {
        allowed_origins,
        allowed_methods: vec![Method::Get].into_iter().map(From::from).collect(),
        allowed_headers: AllowedHeaders::some(&[
            "Authorization",
            "Accept",
            "Access-Control-Allow-Origin",
        ]),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("error while building CORS")
}

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
#[patch("/info", data = "<comic_info>")]
fn patch_pdf_info(comic_info: Json<Comic>){
    use schema::comic::dsl::{comic, title};
    let connection = establish_connection();
    let uuid = comic_info.id;
    let patch_title = &comic_info.title;
    // let uuid = Uuid::parse_str(&id).unwrap();
    let post = diesel::update(comic.find(uuid))
        .set(title.eq(patch_title))
        .get_result::<Comic>(&connection)
        .expect(&format!("Unable to find post {}", uuid));
    println!("Published post {}", post.title);
}
#[get("/<id>")]
fn get_img(id: String) -> Option<NamedFile> {
    NamedFile::open(Path::new(&format!("assets/img/{}.jpg", id))).ok()
}
fn rocket() -> rocket::Rocket {
    rocket::ignite()
    .mount("/", routes![index])
    .mount("/pdf", routes![pdf_list, get_pdf, patch_pdf_info])
    .mount("/thumbnail", routes![get_img])
    .attach(make_cors())
}
fn main() -> Result<(), Error>{
    rocket().launch();
    Ok(())
}