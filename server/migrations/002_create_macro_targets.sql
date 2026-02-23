CREATE TABLE macro_targets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(255) NOT NULL,
  calories    INT NOT NULL,
  protein_g   INT NOT NULL,
  carbs_g     INT NOT NULL,
  fat_g       INT NOT NULL,
  is_custom   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)
);