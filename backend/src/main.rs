#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

#[macro_use] extern crate diesel;
mod pdfs;
mod models;

use pdfs::*;
use backend::*;
use models::*;
use diesel::prelude::*;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
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