use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize, Queryable)]
pub struct Comic {
    pub id: i32,
    pub author: Option<String>,
    pub title: String,
    pub thumbnail: Option<String>,
    pub pdf: Option<String>,
    pub tab: Option<Vec<String>>,
    pub folder_id: Option<String>
}