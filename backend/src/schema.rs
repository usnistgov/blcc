// @generated automatically by Diesel CLI.

diesel::table! {
    zip_state (zipcode) {
        zipcode -> Int4,
        #[max_length = 2]
        state -> Varchar,
    }
}
