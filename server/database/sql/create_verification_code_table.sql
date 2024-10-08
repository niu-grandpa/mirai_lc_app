CREATE TABLE IF NOT EXISTS verification_code (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(6) NOT NULL,
  phoneNumber VARCHAR(16) NOT NULL,
  createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)