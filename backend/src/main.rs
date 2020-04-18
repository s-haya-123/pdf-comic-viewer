#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

#[macro_use] extern crate diesel;
mod models;

use backend::*;
use models::*;
use diesel::prelude::*;
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};



#[derive(Debug, Serialize, Deserialize)]
pub struct PDF {
    pub id: String,
    pub author: String,
    pub title: String,
    pub thumbnail: String,
    pub pdf: String,
    pub tag: Vec<String>
}
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

fn main() {
    use schema::comic::dsl::*;
    let connection = establish_connection();
    let results = comic
    .load::<Comic>(&connection)
    .expect("Error loading posts");
    println!("Displaying {} posts", results.len());
    for post in results {
        println!("{}", post.title);
        println!("----------\n");
    }
    rocket::ignite().mount("/", routes![index, pdf]).launch();
}