table! {
    comic (id) {
        id -> Int4,
        author -> Nullable<Text>,
        title -> Text,
        thumbnail -> Nullable<Text>,
        pdf -> Nullable<Text>,
        tag -> Nullable<Array<Text>>,
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
