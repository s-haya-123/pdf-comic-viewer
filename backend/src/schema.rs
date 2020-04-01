table! {
    comic (id) {
        id -> Int4,
        author -> Nullable<Text>,
        title -> Text,
        thumbnail -> Nullable<Text>,
        pdf -> Nullable<Text>,
        tag -> Nullable<Array<Text>>,
    }
}
