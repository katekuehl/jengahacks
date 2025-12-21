-- Add database-level CHECK constraints for input validation
-- This migration adds an additional layer of defense-in-depth validation
-- Even if other validation layers are bypassed, the database will enforce data integrity

-- Add CHECK constraint for email format
-- Validates basic email structure at database level
ALTER TABLE public.registrations
ADD CONSTRAINT check_email_format
CHECK (
  email ~* '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
  AND length(email) <= 254
);

-- Add CHECK constraint for full_name
-- Validates name length and basic character set
-- Note: Using ASCII-compatible pattern for PostgreSQL compatibility
-- Unicode letters are handled by client-side validation
ALTER TABLE public.registrations
ADD CONSTRAINT check_full_name
CHECK (
  length(full_name) >= 2
  AND length(full_name) <= 100
  AND full_name ~ '^[a-zA-Z\s''-]+$' -- Letters, spaces, apostrophes, hyphens
);

-- Add CHECK constraint for whatsapp_number (if provided)
-- Validates WhatsApp number format when not null
ALTER TABLE public.registrations
ADD CONSTRAINT check_whatsapp_number
CHECK (
  whatsapp_number IS NULL
  OR (
    length(whatsapp_number) >= 7
    AND length(whatsapp_number) <= 20
    AND whatsapp_number ~ '^\+?[1-9]\d{6,14}$' -- E.164 format
  )
);

-- Add CHECK constraint for linkedin_url (if provided)
-- Validates LinkedIn URL format when not null
ALTER TABLE public.registrations
ADD CONSTRAINT check_linkedin_url
CHECK (
  linkedin_url IS NULL
  OR (
    length(linkedin_url) <= 500
    AND (
      linkedin_url ~* '^https?://(www\.)?linkedin\.com/'
      OR linkedin_url ~* '^linkedin\.com/'
    )
  )
);

-- Add CHECK constraint for resume_path (if provided)
-- Validates resume path format when not null
ALTER TABLE public.registrations
ADD CONSTRAINT check_resume_path
CHECK (
  resume_path IS NULL
  OR (
    length(resume_path) <= 500
    AND resume_path ~ '^[a-zA-Z0-9._-]+$' -- Only safe filename characters
    AND resume_path ~ '\.pdf$' -- Must end with .pdf
  )
);

-- Add comments for documentation
COMMENT ON CONSTRAINT check_email_format ON public.registrations IS 
  'Validates email format and length (max 254 chars per RFC 5321)';
COMMENT ON CONSTRAINT check_full_name ON public.registrations IS 
  'Validates full name length (2-100 chars) and character set (letters, spaces, apostrophes, hyphens)';
COMMENT ON CONSTRAINT check_whatsapp_number ON public.registrations IS 
  'Validates WhatsApp number format (E.164 standard, 7-15 digits with optional + prefix)';
COMMENT ON CONSTRAINT check_linkedin_url ON public.registrations IS 
  'Validates LinkedIn URL format and length (max 500 chars)';
COMMENT ON CONSTRAINT check_resume_path ON public.registrations IS 
  'Validates resume file path format (safe filename characters, must end with .pdf, max 500 chars)';

