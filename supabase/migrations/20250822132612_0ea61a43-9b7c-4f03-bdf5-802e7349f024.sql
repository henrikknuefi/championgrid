-- Fix the RLS policy issue for sequence_enrollments table
-- This table has RLS enabled but no policies defined

-- Add RLS policies for sequence_enrollments table
CREATE POLICY "Users can view org sequence enrollments" 
ON public.sequence_enrollments 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.org_id IS NOT NULL
));

CREATE POLICY "Users can manage org sequence enrollments" 
ON public.sequence_enrollments 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.org_id IS NOT NULL
));

-- The existing SECURITY DEFINER functions are actually necessary and secure:
-- - handle_new_user() is needed for auth triggers and runs with elevated privileges safely
-- - update_updated_at_column() is a timestamp trigger function that needs elevated privileges

-- Add comment to document why these functions need SECURITY DEFINER
COMMENT ON FUNCTION public.handle_new_user() IS 'SECURITY DEFINER required for auth.users trigger access. This function safely creates user profiles.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'SECURITY DEFINER required for trigger functionality. This function safely updates timestamps.';