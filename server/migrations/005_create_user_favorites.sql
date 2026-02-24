CREATE TABLE user_favorites (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            VARCHAR(255) NOT NULL,
  food_name          VARCHAR(255) NOT NULL,
  barcode            VARCHAR(100),
  calories_per_100g  INT          NOT NULL,
  protein_per_100g   DECIMAL(6,2) NOT NULL,
  carbs_per_100g     DECIMAL(6,2) NOT NULL,
  fat_per_100g       DECIMAL(6,2) NOT NULL,
  default_serving_g  DECIMAL(6,2),
  source             VARCHAR(50)  NOT NULL DEFAULT 'open_food_facts',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_food (user_id, food_name)
);
