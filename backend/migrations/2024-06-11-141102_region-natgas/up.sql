-- Your SQL goes here
CREATE TABLE region_natgas (
    release_year INTEGER NOT NULL,
    year INTEGER NOT NULL,
    technobasin TEXT NOT NULL,
    "case" TEXT NOT NULL,
    rate TEXT NOT NULL,
    PRIMARY KEY (release_year, year, technobasin, "case", rate),
    kg_co2_per_mj DOUBLE PRECISION NOT NULL
);