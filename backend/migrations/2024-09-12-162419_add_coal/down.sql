-- This file should undo anything in `up.sql`
ALTER TABLE energy_prices DROP COLUMN coal;
ALTER TABLE energy_price_indices DROP COLUMN coal;
ALTER TABLE escalation_rates DROP COLUMN coal;
