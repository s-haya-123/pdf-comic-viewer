table! {
    comic (id) {
        id -> Uuid,
        author -> Nullable<Text>,
        title -> Text,
        tag -> Nullable<Array<Text>>,
        current_page -> Nullable<Int4>,
        folder_id -> Nullable<Text>,
    }
}

table! {
    folder (id) {
        id -> Int4,
        child -> Int4,
        parent -> Int4,
    }
}

allow_tables_to_appear_in_same_query!(
    comic,
    folder,
);
