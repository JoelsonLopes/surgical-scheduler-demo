-- Migration: Add force_password_change flag to users table
-- Date: 2025-10-16
-- Description: Add flag to force password change on first login

-- Add force_password_change column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN users.force_password_change IS 'Flag to force user to change password on first login';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_force_password_change
ON users(force_password_change)
WHERE force_password_change = true;

-- Update existing users to not require password change
UPDATE users
SET force_password_change = false
WHERE force_password_change IS NULL;
