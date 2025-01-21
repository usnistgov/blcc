// @generated automatically by Diesel CLI.

diesel::table! {
    discount_rates (release_year, rate, year) {
        release_year -> Int4,
        rate -> Text,
        year -> Int4,
        real -> Float8,
        nominal -> Float8,
        inflation -> Float8,
    }
}

diesel::table! {
    energy_price_indices (release_year, year, division, sector, case) {
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
        coal -> Nullable<Float8>,
    }
}

diesel::table! {
    energy_prices (release_year, year, division, sector, case) {
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
        coal -> Nullable<Float8>,
    }
}

diesel::table! {
    escalation_rates (release_year, year, division, sector, case) {
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
        coal -> Nullable<Float8>,
    }
}

diesel::table! {
    region_case_ba (release_year, year, case, rate, ba) {
        release_year -> Int4,
        ba -> Text,
        case -> Text,
        rate -> Text,
        year -> Int4,
        kg_co2_per_mwh -> Float8,
    }
}

diesel::table! {
    region_case_oil (release_year, year, padd, case, rate) {
        release_year -> Int4,
        year -> Int4,
        padd -> Text,
        case -> Text,
        rate -> Text,
        kg_co2_per_mj -> Float8,
    }
}

diesel::table! {
    region_case_propane_lng (release_year, year, padd, case, rate) {
        release_year -> Int4,
        year -> Int4,
        padd -> Text,
        case -> Text,
        rate -> Text,
        kg_co2_per_mj -> Float8,
    }
}

diesel::table! {
    region_case_reeds (release_year, year, reeds, case, rate) {
        release_year -> Int4,
        year -> Int4,
        reeds -> Text,
        case -> Text,
        rate -> Text,
        kg_co2_per_mwh -> Float8,
    }
}

diesel::table! {
    region_natgas (release_year, year, technobasin, case, rate) {
        release_year -> Int4,
        year -> Int4,
        technobasin -> Text,
        case -> Text,
        rate -> Text,
        kg_co2_per_mj -> Float8,
    }
}

diesel::table! {
    scc (release_year, year) {
        year -> Int4,
        release_year -> Int4,
        three_percent_ninety_fifth_percentile -> Float8,
        five_percent_average -> Float8,
        three_percent_average -> Float8,
    }
}

diesel::table! {
    state_division_region (state) {
        state -> Text,
        division -> Text,
        region -> Text,
    }
}

diesel::table! {
    zip_info (zip) {
        zip -> Int4,
        ba -> Text,
        gea -> Text,
        state -> Text,
        padd -> Text,
        technobasin -> Text,
        #[max_length = 4]
        reeds_ba -> Nullable<Varchar>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    discount_rates,
    energy_price_indices,
    energy_prices,
    escalation_rates,
    region_case_ba,
    region_case_oil,
    region_case_propane_lng,
    region_case_reeds,
    region_natgas,
    scc,
    state_division_region,
    zip_info,
);
