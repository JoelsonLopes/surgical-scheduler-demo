-- Create enum for user roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR');
    END IF;
END$$;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'DOCTOR',
  medical_license TEXT,
  specialty TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT medical_license_required_for_doctor CHECK (
    role != 'DOCTOR' OR (role = 'DOCTOR' AND medical_license IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_medical_license ON public.users(medical_license) WHERE medical_license IS NOT NULL;

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Cannot change role, is_active, or is_blocked
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.users WHERE id = auth.uid()) AND
    is_blocked = (SELECT is_blocked FROM public.users WHERE id = auth.uid())
  );

-- Policy: Doctors can view other doctors (for doctor listing)
CREATE POLICY "Doctors can view other doctors"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (role = 'DOCTOR' AND is_active = true AND is_blocked = false);

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Users table for surgical block management system';
COMMENT ON COLUMN public.users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN public.users.email IS 'Unique email for user login';
COMMENT ON COLUMN public.users.name IS 'Full name of the user';
COMMENT ON COLUMN public.users.role IS 'User role in the system (ADMIN or DOCTOR)';
COMMENT ON COLUMN public.users.medical_license IS 'Medical license number (required for doctors)';
COMMENT ON COLUMN public.users.specialty IS 'Medical specialty';
COMMENT ON COLUMN public.users.phone IS 'Contact phone number';
COMMENT ON COLUMN public.users.is_active IS 'Indicates if the user is active in the system';
COMMENT ON COLUMN public.users.is_blocked IS 'Indicates if the user is blocked (for security)';
COMMENT ON COLUMN public.users.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.users.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN public.users.last_login IS 'Last login timestamp';
