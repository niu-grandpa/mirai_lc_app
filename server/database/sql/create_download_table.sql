CREATE TABLE IF NOT EXISTS download (
  id VARCHAR(32) PRIMARY KEY,
  link VARCHAR(255) NOT NULL,
  createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)