-- Add waitlist functionality
-- This migration adds a waitlist field and functions to check registration capacity

-- Add is_waitlist column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS is_waitlist BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster waitlist queries
CREATE INDEX IF NOT EXISTS idx_registrations_is_waitlist 
ON public.registrations(is_waitlist, created_at);

-- Create function to get current registration count (non-waitlist only)
CREATE OR REPLACE FUNCTION get_registration_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.registrations
  WHERE is_waitlist = false;
  
  RETURN v_count;
END;
$$;

-- Create function to check if registration should go to waitlist
-- Registration limit: 200 participants
CREATE OR REPLACE FUNCTION should_add_to_waitlist()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 200;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.registrations
  WHERE is_waitlist = false;
  
  RETURN v_count >= v_limit;
END;
$$;

-- Create function to get waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(p_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_position INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_position
  FROM public.registrations
  WHERE is_waitlist = true
    AND created_at < (
      SELECT created_at
      FROM public.registrations
      WHERE email = p_email
        AND is_waitlist = true
      LIMIT 1
    );
  
  RETURN COALESCE(v_position, 0);
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_registration_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION should_add_to_waitlist() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_waitlist_position(TEXT) TO anon, authenticated;

