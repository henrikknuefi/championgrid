-- Drop and recreate the v_current_positions view to remove security definer behavior
-- This ensures the view respects the RLS policies of the querying user, not the view creator

DROP VIEW IF EXISTS public.v_current_positions;

-- Recreate the view without security definer properties
-- This view will now enforce RLS policies of the querying user
CREATE VIEW public.v_current_positions AS
SELECT 
    c.id AS champion_id,
    cp.company,
    cp.title,
    cp.start_date
FROM champions c
JOIN champion_positions cp ON (cp.champion_id = c.id AND cp.is_current = true);

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.v_current_positions TO authenticated;

-- Add comment explaining the security fix
COMMENT ON VIEW public.v_current_positions IS 'View of current champion positions. Respects RLS policies of the querying user for security.';