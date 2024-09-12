-- This file should undo anything in `up.sql`
ALTER TABLE energy_prices DROP CONSTRAINT energy_prices_pkey;
ALTER TABLE energy_prices ADD PRIMARY KEY (release_year, year, division, sector);

ALTER TABLE energy_price_indices DROP CONSTRAINT energy_price_indices_pkey;
ALTER TABLE energy_price_indices ADD PRIMARY KEY (release_year, year, division, sector);

ALTER TABLE escalation_rates DROP CONSTRAINT escalation_rates_pkey;
ALTER TABLE escalation_rates ADD PRIMARY KEY (release_year, year, division, sector);
