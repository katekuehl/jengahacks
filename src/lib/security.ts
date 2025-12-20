/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize a filename to prevent path traversal and special character attacks
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove path components
  const basename = fileName.replace(/^.*[\\/]/, '');
  
  // Remove or replace dangerous characters
  return basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

/**
 * Validate file extension (more secure than just checking .endsWith)
 */
export const isValidPdfExtension = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().split('.').pop();
  return extension === 'pdf';
};

/**
 * Validate MIME type for PDF
 */
export const isValidPdfMimeType = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

/**
 * Validate and sanitize URL
 */
export const validateAndSanitizeUrl = (url: string): string | null => {
  if (!url || !url.trim()) {
    return null;
  }

  let sanitized = url.trim();

  // Remove any whitespace
  sanitized = sanitized.replace(/\s/g, '');

  // Add protocol if missing
  if (!sanitized.match(/^https?:\/\//i)) {
    sanitized = `https://${sanitized}`;
  }

  try {
    const urlObj = new URL(sanitized);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    // Validate LinkedIn domain if it's a LinkedIn URL
    if (urlObj.hostname.includes('linkedin.com')) {
      return sanitized;
    }

    // For other URLs, validate basic structure
    if (urlObj.hostname && urlObj.hostname.length > 0) {
      return sanitized;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

/**
 * Validate email format (more comprehensive)
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.length > 254) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Validate full name (alphanumeric, spaces, hyphens, apostrophes)
 */
export const isValidFullName = (name: string): boolean => {
  if (!name || name.length < 2 || name.length > 100) {
    return false;
  }

  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  const nameRegex = /^[\p{L}\s'-]+$/u;
  return nameRegex.test(name);
};

