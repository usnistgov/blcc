-- Your SQL goes here
CREATE TABLE scc (
    year INTEGER NOT NULL,
    release_year INTEGER NOT NULL,
    PRIMARY KEY (release_year, year),
    three_percent_ninety_fifth_percentile DOUBLE PRECISION NOT NULL,
    five_percent_average DOUBLE PRECISION NOT NULL,
    three_percent_average DOUBLE PRECISION NOT NULL,
    two_and_a_half_percent_average DOUBLE PRECISION NOT NULL
);