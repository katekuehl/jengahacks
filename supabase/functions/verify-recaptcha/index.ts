import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCORS, createResponse, createErrorResponse } from "../_shared/utils.ts";

const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

interface VerifyRequest {
  token: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    if (!RECAPTCHA_SECRET_KEY) {
      return createErrorResponse("reCAPTCHA secret key not configured", 500);
    }

    const { token }: VerifyRequest = await req.json();

    if (!token) {
      return createErrorResponse("CAPTCHA token is required", 400);
    }

    // Verify token with Google reCAPTCHA API
    const verifyResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const verifyData = await verifyResponse.json();

    return createResponse({
      success: verifyData.success,
      score: verifyData.score, // For v3, score indicates bot likelihood
      challenge_ts: verifyData.challenge_ts,
      hostname: verifyData.hostname,
    });
  } catch (error) {
    return createErrorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});


