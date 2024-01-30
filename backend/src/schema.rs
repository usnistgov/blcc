// @generated automatically by Diesel CLI.

diesel::table! {
    escalation_rates (release_year, year, division, sector) {
        release_year -> Int4,
        year -> Int4,
        division -> Text,
        sector -> Text,
        case -> Text,
        region -> Text,
        propane -> Nullable<Float8>,
        distillate_fuel_oil -> Nullable<Float8>,
        residual_fuel_oil -> Nullable<Float8>,
        natural_gas -> Nullable<Float8>,
        electricity -> Nullable<Float8>,
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
