-- Track incomplete registrations (emails entered but registration not completed)
-- This helps identify potential issues in the registration flow and follow up with interested participants

-- Create incomplete_registrations table
CREATE TABLE IF NOT EXISTS public.incomplete_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  whatsapp_number TEXT,
  full_name TEXT,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  form_data JSONB, -- Store partial form data for analysis
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure at least email or whatsapp_number is provided
  CONSTRAINT check_email_or_whatsapp CHECK (email IS NOT NULL OR whatsapp_number IS NOT NULL)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_incomplete_registrations_email 
ON public.incomplete_registrations(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incomplete_registrations_whatsapp 
ON public.incomplete_registrations(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incomplete_registrations_completed 
ON public.incomplete_registrations(completed, entered_at);

CREATE INDEX IF NOT EXISTS idx_incomplete_registrations_entered_at 
ON public.incomplete_registrations(entered_at DESC);

-- Enable RLS
ALTER TABLE public.incomplete_registrations ENABLE ROW LEVEL SECURITY;

-- Only allow inserting incomplete registrations (public)
CREATE POLICY "Anyone can log incomplete registrations"
ON public.incomplete_registrations
FOR INSERT
WITH CHECK (true);

-- Only allow updating to mark as completed (public)
CREATE POLICY "Anyone can mark incomplete registration as completed"
ON public.incomplete_registrations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Prevent reading incomplete registrations (admin only via service role)
CREATE POLICY "No public read access to incomplete registrations"
ON public.incomplete_registrations
FOR SELECT
USING (false);

-- Function to log incomplete registration
CREATE OR REPLACE FUNCTION log_incomplete_registration(
  p_email TEXT DEFAULT NULL,
  p_whatsapp_number TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_form_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
  v_email TEXT := NULLIF(LOWER(TRIM(p_email)), '');
  v_whatsapp TEXT := NULLIF(TRIM(p_whatsapp_number), '');
BEGIN
  -- Ensure at least email or whatsapp_number is provided
  IF v_email IS NULL AND v_whatsapp IS NULL THEN
    RAISE EXCEPTION 'Either email or whatsapp_number must be provided';
  END IF;
  
  -- Check if email or whatsapp already exists and is not completed
  SELECT id INTO v_id
  FROM public.incomplete_registrations
  WHERE (
    (v_email IS NOT NULL AND email = v_email)
    OR (v_whatsapp IS NOT NULL AND whatsapp_number = v_whatsapp)
  )
    AND completed = false
  ORDER BY entered_at DESC
  LIMIT 1;
  
  IF v_id IS NOT NULL THEN
    -- Update existing incomplete registration
    UPDATE public.incomplete_registrations
    SET 
      last_activity_at = now(),
      email = COALESCE(v_email, email),
      whatsapp_number = COALESCE(v_whatsapp, whatsapp_number),
      full_name = COALESCE(p_full_name, full_name),
      form_data = COALESCE(p_form_data, form_data),
      ip_address = COALESCE(p_ip_address, ip_address),
      user_agent = COALESCE(p_user_agent, user_agent)
    WHERE id = v_id;
    
    RETURN v_id;
  ELSE
    -- Insert new incomplete registration
    INSERT INTO public.incomplete_registrations (
      email,
      whatsapp_number,
      full_name,
      ip_address,
      user_agent,
      form_data
    )
    VALUES (
      v_email,
      v_whatsapp,
      p_full_name,
      p_ip_address,
      p_user_agent,
      p_form_data
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
  END IF;
END;
$$;

-- Function to mark incomplete registration as completed
CREATE OR REPLACE FUNCTION mark_incomplete_registration_completed(
  p_email TEXT DEFAULT NULL,
  p_whatsapp_number TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INTEGER;
  v_email TEXT := NULLIF(LOWER(TRIM(p_email)), '');
  v_whatsapp TEXT := NULLIF(TRIM(p_whatsapp_number), '');
BEGIN
  -- Ensure at least email or whatsapp_number is provided
  IF v_email IS NULL AND v_whatsapp IS NULL THEN
    RAISE EXCEPTION 'Either email or whatsapp_number must be provided';
  END IF;
  
  UPDATE public.incomplete_registrations
  SET 
    completed = true,
    completed_at = now()
  WHERE (
    (v_email IS NOT NULL AND email = v_email)
    OR (v_whatsapp IS NOT NULL AND whatsapp_number = v_whatsapp)
  )
    AND completed = false;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  RETURN v_updated > 0;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_incomplete_registration(TEXT, TEXT, TEXT, INET, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_incomplete_registration_completed(TEXT, TEXT) TO anon, authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.incomplete_registrations IS 'Tracks emails and WhatsApp numbers entered in registration form but registration not completed';
COMMENT ON COLUMN public.incomplete_registrations.email IS 'Email address entered by user';
COMMENT ON COLUMN public.incomplete_registrations.whatsapp_number IS 'WhatsApp number entered by user';
COMMENT ON COLUMN public.incomplete_registrations.entered_at IS 'When email or WhatsApp number was first entered';
COMMENT ON COLUMN public.incomplete_registrations.last_activity_at IS 'Last time user interacted with form';
COMMENT ON COLUMN public.incomplete_registrations.completed IS 'Whether registration was eventually completed';
COMMENT ON COLUMN public.incomplete_registrations.form_data IS 'Partial form data for analysis';

