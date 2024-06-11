-- Your SQL goes here
CREATE TABLE region_case_reeds (
    release_year INTEGER NOT NULL,
    year INTEGER NOT NULL,
    reeds TEXT NOT NULL,
    "case" TEXT NOT NULL,
    rate TEXT NOT NULL,
    PRIMARY KEY (release_year, year, reeds, "case", rate),
    kg_co2_per_mwh DOUBLE PRECISION NOT NULL
);