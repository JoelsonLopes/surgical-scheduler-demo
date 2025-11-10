-- 1. Create a function to securely get the role of the current user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role::text FROM public.users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the old, recursive policy
DROP POLICY "Admins can manage all users" ON public.users;

-- 3. Create the new policy using the helper function
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING ( get_my_role() = 'ADMIN' )
  WITH CHECK ( get_my_role() = 'ADMIN' );
