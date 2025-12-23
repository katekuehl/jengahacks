/**
 * Shared types for registration flow
 */

export interface RegistrationFormData {
    fullName: string;
    email: string;
    whatsapp: string;
    linkedIn: string;
    resume: File | null;
}

export interface RegistrationResult {
    success: boolean;
    registrationId?: string;
    accessToken?: string;
    isWaitlist?: boolean;
    waitlistPosition?: number;
    error?: string;
}

export interface RegistrationSubmissionData {
    fullName: string;
    email: string;
    whatsapp: string | null;
    linkedIn: string | null;
    resumePath: string | null;
}
