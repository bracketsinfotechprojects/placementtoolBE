-- Create a test user for forgot password testing
-- Password is 'password123' hashed with bcrypt

INSERT INTO users (loginID, password, roleID, status, isDeleted)
VALUES (
  'test@example.com',
  '$2b$10$rKJ5VqZ9YqZ9YqZ9YqZ9YeN5VqZ9YqZ9YqZ9YqZ9YqZ9YqZ9YqZ9Y',
  1,
  'active',
  0
)
ON DUPLICATE KEY UPDATE
  password = '$2b$10$rKJ5VqZ9YqZ9YqZ9YqZ9YeN5VqZ9YqZ9YqZ9YqZ9YqZ9YqZ9YqZ9Y',
  status = 'active',
  isDeleted = 0;

-- Verify the user was created
SELECT id, loginID, roleID, status FROM users WHERE loginID = 'test@example.com';
