CREATE TABLE users (
  id             VARCHAR(255) PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  name           VARCHAR(255),
  age            INT,
  weight_kg      DECIMAL(5,2),
  height_cm      INT,
  sex            ENUM('male', 'female'),
  activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
  goal_type      ENUM('cut', 'bulk', 'maintain') DEFAULT 'maintain',
  diet_type      VARCHAR(50) DEFAULT 'standard',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);