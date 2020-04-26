use serde::{Deserialize, Serialize};
use uuid::Uuid;
#[derive(Debug, Serialize, Deserialize, Queryable)]
pub struct Comic {
    pub id: Uuid,
    pub author: Option<String>,
    pub title: String,
    pub tag: Option<Vec<String>>,
    pub current_page: Option<i32>,
    pub folder_id: Option<String>
}