-- Your SQL goes here
ALTER TABLE escalation_rates DROP CONSTRAINT escalation_rates_pkey;

ALTER TABLE escalation_rates ADD PRIMARY KEY (release_year, year, division, sector, "case", region);

