-- Your SQL goes here
CREATE TABLE scc (
    year INTEGER NOT NULL,
    release_year INTEGER NOT NULL,
    PRIMARY KEY (release_year, year),
    three_percent_ninety_fifth_percentile DOUBLE PRECISION NOT NULL,
    FivePercentAverage DOUBLE PRECISION NOT NULL,
    ThreePercentAverage DOUBLE PRECISION NOT NULL,
    TwoAndAHalfPercentAverage DOUBLE PRECISION NOT NULL
);