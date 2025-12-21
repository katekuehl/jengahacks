-- Add explicit RLS policies to protect against UPDATE and DELETE operations
-- This migration addresses the MISSING_RLS_PROTECTION security issue
-- by explicitly denying UPDATE and DELETE operations for all users

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Deny all updates" ON public.registrations;
DROP POLICY IF EXISTS "Deny all deletes" ON public.registrations;

-- Explicitly deny UPDATE operations for all users
-- This prevents anyone from modifying registration records
CREATE POLICY "Deny all updates"
ON public.registrations
FOR UPDATE
USING (false)
WITH CHECK (false);

-- Explicitly deny DELETE operations for all users
-- This prevents anyone from deleting registration records
CREATE POLICY "Deny all deletes"
ON public.registrations
FOR DELETE
USING (false);

-- Add comments for documentation
COMMENT ON POLICY "Deny all updates" ON public.registrations IS 
  'Explicitly denies all UPDATE operations. Registration records are immutable once created.';
COMMENT ON POLICY "Deny all deletes" ON public.registrations IS 
  'Explicitly denies all DELETE operations. Registration records cannot be deleted by users.';

