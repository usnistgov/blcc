-- Your SQL goes here
CREATE TABLE region_case_oil (
    release_year INTEGER NOT NULL,
    year INTEGER NOT NULL,
    padd TEXT NOT NULL,
    "case" TEXT NOT NULL,
    rate TEXT NOT NULL,
    PRIMARY KEY (release_year, year, padd, "case", rate),
    kg_co2_per_mj DOUBLE PRECISION NOT NULL
);