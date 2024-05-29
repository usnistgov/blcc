-- Your SQL goes here
CREATE TABLE region_case_ba (
    release_year INTEGER NOT NULL,
    ba TEXT NOT NULL,
    "case" TEXT NOT NULL,
    rate TEXT NOT NULL,
    year INTEGER NOT NULL,
    PRIMARY KEY (release_year, year, "case", rate, ba),
    kg_co2_per_mwh DOUBLE PRECISION NOT NULL
);