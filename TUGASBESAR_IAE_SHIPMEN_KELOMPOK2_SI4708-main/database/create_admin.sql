-- Create default admin user for ShipXpress
-- Password: admin123 (hashed with bcrypt)

-- Insert admin user if not exists
INSERT INTO users (username, email, password_hash, full_name, role)
SELECT 
  'admin',
  'admin@shipxpress.com',
  '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- This is a placeholder, will be updated
  'Administrator',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@shipxpress.com' OR username = 'admin'
);

-- Note: The password hash above is a placeholder
-- In production, use bcrypt to hash 'admin123' properly
-- For now, users should register or we can create via GraphQL mutation

