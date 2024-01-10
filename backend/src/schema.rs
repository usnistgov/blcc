// @generated automatically by Diesel CLI.

diesel::table! {
    escalation_rates (year) {
        year -> Int4,
        rate -> Nullable<Float8>,
    }
}

diesel::table! {
    zip_state (zipcode) {
        zipcode -> Int4,
        #[max_length = 2]
        state -> Varchar,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    escalation_rates,
    zip_state,
);
