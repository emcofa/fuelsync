CREATE TABLE custom_foods (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             VARCHAR(255) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  calories_per_100g   INT NOT NULL,
  protein_per_100g    DECIMAL(6,2) NOT NULL,
  carbs_per_100g      DECIMAL(6,2) NOT NULL,
  fat_per_100g        DECIMAL(6,2) NOT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);