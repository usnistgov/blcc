-- Your SQL goes here
CREATE TABLE energy_price_indices (
    release_year INTEGER NOT NULL,
    year INTEGER NOT NULL,
    division TEXT NOT NULL,
    sector TEXT NOT NULL,
    PRIMARY KEY (release_year, year, division, sector),
    "case" TEXT NOT NULL,
    region TEXT NOT NULL,
    propane DOUBLE PRECISION,
    distillate_fuel_oil DOUBLE PRECISION,
    residual_fuel_oil DOUBLE PRECISION,
    natural_gas DOUBLE PRECISION,
    electricity DOUBLE PRECISION
);