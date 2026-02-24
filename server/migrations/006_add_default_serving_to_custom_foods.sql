ALTER TABLE custom_foods
  ADD COLUMN default_serving_g DECIMAL(6,2) DEFAULT NULL AFTER fat_per_100g;
