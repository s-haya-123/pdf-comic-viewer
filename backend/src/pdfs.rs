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

#[get("/pdf")]
pub fn pdf() -> Json<Vec<PDF>> {
    Json(vec![PDF {
        id: "1".into(),
        author: "author".into(),
        title: "titile".into(),
        thumbnail: "http://thumb".into(),
        pdf: "http://pdf".into(),
        tag: vec!["tag".into()]
    }])
}
