/**
 * Registration service for handling registration submission logic
 */

import { logger } from "@/lib/logger";
import { trackRegistration } from "@/lib/analytics";
import { markIncompleteRegistrationCompleted } from "@/lib/incompleteRegistration";
import {
  RegistrationResult,
  RegistrationSubmissionData,
  RegistrationFormData
} from "@/types/registration";
import { callRpc } from "@/lib/supabaseRpc";
import { supabase } from "@/integrations/supabase/client";

// TODO: Extract common error handling patterns into utility functions
export const registrationService = {
  /**
   * Check if registration should be added to waitlist
   */
  async checkWaitlist(): Promise<{ shouldWaitlist: boolean; error?: Error }> {
    try {
      const { data: shouldWaitlist, error: waitlistCheckError } = await callRpc<boolean>(
        "should_add_to_waitlist",
        {}
      );

      if (waitlistCheckError) {
        logger.error("Waitlist check error", waitlistCheckError, {});
        return { shouldWaitlist: false, error: waitlistCheckError };
      }

      return { shouldWaitlist: shouldWaitlist === true };
    } catch (error) {
      logger.error(
        "Waitlist check error",
        error instanceof Error ? error : new Error(String(error)),
        {}
      );
      return {
        shouldWaitlist: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Generate access token for registration management
   */
  async generateAccessToken(): Promise<{ token: string | null; error?: Error }> {
    try {
      const { data: accessToken, error: tokenError } = await callRpc<string>("generate_access_token", {});

      if (tokenError) {
        logger.error("Access token generation error", tokenError, {});
        return { token: null, error: tokenError };
      }

      return { token: (accessToken as string) || null };
    } catch (error) {
      logger.error(
        "Access token generation error",
        error instanceof Error ? error : new Error(String(error)),
        {}
      );
      return {
        token: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Submit registration to database
   */
  async submitRegistration({
    data,
    isWaitlist,
    accessToken,
  }: {
    data: RegistrationSubmissionData;
    isWaitlist: boolean;
    accessToken: string | null;
  }): Promise<{ registrationId: string | null; error?: Error }> {
    try {
      // Check if Edge Function is enabled
      const useEdgeFunction = import.meta.env.VITE_USE_REGISTRATION_EDGE_FUNCTION === "true";
      
      if (!useEdgeFunction) {
        const error = new Error(
          "Edge Function registration is disabled. Please set VITE_USE_REGISTRATION_EDGE_FUNCTION=true in your environment variables."
        );
        logger.error("Edge Function disabled", error, { email: data.email, fullName: data.fullName });
        return { registrationId: null, error };
      }

      const { data: registrationData, error: insertError } = await supabase.functions.invoke(
        "register-with-ip",
        {
          body: {
            full_name: data.fullName,
            email: data.email,
            whatsapp_number: data.whatsapp || null,
            linkedin_url: data.linkedIn || null,
            resume_path: data.resumePath || null,
            is_waitlist: isWaitlist,
            access_token: accessToken || undefined,
          },
        }
      );

      // Handle function error structure (which might wrap errors)
      if (insertError) {
        // Provide more descriptive error messages
        let errorMessage = "Failed to send a request to the Edge Function when registering";
        
        if (insertError.message) {
          errorMessage = insertError.message;
        } else if (typeof insertError === "string") {
          errorMessage = insertError;
        } else if (insertError instanceof Error) {
          errorMessage = insertError.message;
        }

        // Check for common error scenarios
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          errorMessage = "Edge Function not found. Please ensure the 'register-with-ip' Edge Function is deployed.";
        } else if (errorMessage.includes("CORS") || errorMessage.includes("cors")) {
          errorMessage = "CORS error when calling Edge Function. Please check Edge Function CORS configuration.";
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          errorMessage = "Network error when calling Edge Function. Please check your internet connection and Supabase configuration.";
        }

        const error = new Error(errorMessage);
        logger.error(
          "Registration insert error",
          error,
          { 
            email: data.email, 
            fullName: data.fullName,
            originalError: insertError,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL
          }
        );
        return { registrationId: null, error };
      }

      // Check for success in the response data 
      if (registrationData && !registrationData.success) {
        // Re-construct error from response if success is false
        const error = new Error(registrationData.error || "Registration failed");
        logger.error("Registration function error", error, { email: data.email, fullName: data.fullName });
        return { registrationId: null, error };
      }

      return { registrationId: registrationData?.data?.id || null };
    } catch (error) {
      // Handle network errors, timeouts, etc.
      let errorMessage = "Failed to send a request to the Edge Function when registering";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes("fetch") || error.message.includes("network")) {
          errorMessage = "Network error: Unable to connect to the Edge Function. Please check your internet connection and ensure the Edge Function is deployed.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timeout: The Edge Function took too long to respond. Please try again.";
        }
      }

      const registrationError = new Error(errorMessage);
      logger.error(
        "Registration insert error",
        registrationError,
        { 
          email: data.email, 
          fullName: data.fullName,
          originalError: error,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL
        }
      );
      return {
        registrationId: null,
        error: registrationError,
      };
    }
  },

  /**
   * Get waitlist position for email
   */
  async getWaitlistPosition(email: string): Promise<number | null> {
    try {
      const { data: position, error: positionError } = await callRpc<number>("get_waitlist_position", {
        p_email: email,
      });

      if (!positionError && position !== null && position !== undefined) {
        return position as number;
      }

      return null;
    } catch (error) {
      logger.warn("Failed to get waitlist position", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  /**
   * Complete registration submission flow
   */
  async submit(
    formData: RegistrationFormData & { fullName?: string },
    resumePath: string | null
  ): Promise<RegistrationResult> {
    try {
      // Capture and sanitize form data
      // Use provided fullName if available (from combined firstName + lastName), otherwise combine
      const fullName = formData.fullName 
        ? formData.fullName.trim()
        : `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const email = formData.email.trim().toLowerCase();
      const whatsapp = formData.whatsapp?.trim() || null;
      const linkedIn = formData.linkedIn.trim() || null;

      // Check waitlist status
      const { shouldWaitlist, error: waitlistError } = await this.checkWaitlist();
      const isWaitlist = shouldWaitlist;

      // Generate access token
      const { token: accessToken, error: tokenError } = await this.generateAccessToken();

      // Submit registration
      const submissionData: RegistrationSubmissionData = {
        fullName,
        email,
        whatsapp,
        linkedIn,
        resumePath,
      };

      const { registrationId, error: insertError } = await this.submitRegistration({
        data: submissionData,
        isWaitlist,
        accessToken: accessToken || null,
      });

      if (insertError) {
        // Check for rate limit violation
        if (
          insertError.message?.includes("rate limit") ||
          insertError.message?.includes("too many")
        ) {
          const rateLimitError = "Rate limit exceeded. Please try again later.";
          trackRegistration(false, rateLimitError);
          return {
            success: false,
            error: rateLimitError,
          };
        }

        const errorMessage = insertError.message || "Registration failed";
        trackRegistration(false, errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Get waitlist position if applicable
      let waitlistPosition: number | null = null;
      if (isWaitlist) {
        waitlistPosition = await this.getWaitlistPosition(email);
      }

      // Mark incomplete registration as completed
      if (email) {
        markIncompleteRegistrationCompleted(email).catch((err) => {
          logger.error("Failed to mark incomplete registration as completed", err);
        });
      }

      // Track successful registration
      trackRegistration(true);

      return {
        success: true,
        registrationId: registrationId || undefined,
        accessToken: accessToken || undefined,
        isWaitlist,
        waitlistPosition: waitlistPosition || undefined,
      };
    } catch (error) {
      const fullNameForLog = formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      logger.error(
        "Registration error",
        error instanceof Error ? error : new Error(String(error)),
        { email: formData.email, fullName: fullNameForLog }
      );

      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      trackRegistration(false, errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

