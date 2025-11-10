-- Migration: Allow users to update force_password_change and last_login
-- Date: 2025-10-16
-- Description: Update RLS policy to allow users to update their own force_password_change and last_login fields

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create a new policy that allows users to update their own profile
-- including force_password_change and last_login, but not role, is_active, or is_blocked
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

-- Add comment explaining the policy
COMMENT ON POLICY "Users can update their own profile" ON public.users IS
'Allows users to update their own profile fields including name, phone, force_password_change, and last_login.
Users cannot change their own role, is_active, or is_blocked status.';
