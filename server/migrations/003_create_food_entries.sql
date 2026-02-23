CREATE TABLE food_entries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(255) NOT NULL,
  food_name   VARCHAR(255) NOT NULL,
  barcode     VARCHAR(100),
  calories    INT NOT NULL,
  protein_g   DECIMAL(6,2) NOT NULL,
  carbs_g     DECIMAL(6,2) NOT NULL,
  fat_g       DECIMAL(6,2) NOT NULL,
  serving_g   DECIMAL(6,2) NOT NULL DEFAULT 100,
  meal_type   ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  logged_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, logged_at)
);