// @generated automatically by Diesel CLI.

diesel::table! {
    scc (year, release_year) {
        year -> Int4,
        release_year -> Int4,
        three_percent_ninety_fifth_percentile -> Float8,
        five_percent_average -> Float8,
        three_percent_average -> Float8,
        two_and_a_half_percent_average-> Float8
    }
}

diesel::table! {
    zip_info (zip) {
        zip -> Int4,
        ba -> Text,
        gea -> Text,
        state -> Text,
        padd -> Text,
        technobasin -> Text
    }
}

diesel::table! {
    region_case_ba (release_year, year, case, rate, ba) {
        release_year -> Int4,
        year -> Int4,
        ba -> Text,
        case -> Text,
        rate -> Text,
        kg_co2_per_mwh -> Float8
    }
}

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

diesel::allow_tables_to_appear_in_same_query!(region_case_ba, escalation_rates, zip_info, scc,);
diesel::allow_columns_to_appear_in_same_group_by_clause!(region_case_ba::year, region_case_ba::release_year);
