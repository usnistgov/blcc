-- Your SQL goes here
CREATE TABLE discount_rates (
    release_year INTEGER NOT NULL,
    rate TEXT NOT NULL,
    year INTEGER NOT NULL,
    PRIMARY KEY (release_year, rate, year),
    real DOUBLE PRECISION NOT NULL,
    nominal DOUBLE PRECISION NOT NULL,
    inflation DOUBLE PRECISION NOT NULL
);