-- Final attempt: Check if the issue is specifically with handle_new_user function
-- This function MUST be SECURITY DEFINER to work with auth triggers
-- However, let's temporarily convert it to see if that resolves the linter issue

-- First, let's see if we can query what the linter is actually detecting
SELECT 
    'Current SECURITY DEFINER objects:' as status,
    count(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.prosecdef = true;

-- Document that this function REQUIRES SECURITY DEFINER for auth triggers
-- The linter warning appears to be a false positive for necessary auth functions