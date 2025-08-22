-- Test fix: Convert the update_updated_at_column function to SECURITY INVOKER
-- This function updates timestamps and can work without elevated privileges
-- if the user has UPDATE permissions on the table

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public';

-- Keep handle_new_user as SECURITY DEFINER since it needs to insert into profiles 
-- table and access auth.users metadata, which requires elevated privileges

COMMENT ON FUNCTION public.update_updated_at_column() IS 'SECURITY INVOKER function for updating timestamps. Now uses user permissions.';
COMMENT ON FUNCTION public.handle_new_user() IS 'SECURITY DEFINER required for auth.users trigger access. This function safely creates user profiles.';