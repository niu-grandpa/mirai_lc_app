CREATE TABLE IF NOT EXISTS account (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  account VARCHAR(10) NOT NULL,
  createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)