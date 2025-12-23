import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCORS, createResponse, createErrorResponse } from "../_shared/utils.ts";

interface GetResumeUrlRequest {
  resume_path: string;
  admin_password?: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get authorization header (optional - for future Supabase Auth integration)
    const authHeader = req.headers.get("Authorization");

    // For now, allow access if admin password is provided in request body
    const { admin_password, resume_path }: GetResumeUrlRequest = await req.json();

    // Basic admin password check
    const expectedPassword = Deno.env.get("ADMIN_PASSWORD") || "admin123";

    if (admin_password !== expectedPassword && !authHeader) {
      return createErrorResponse("Unauthorized - Admin access required", 401);
    }

    // If auth header is provided, verify Supabase Auth token
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return createErrorResponse("Unauthorized - Invalid token", 401);
      }
    }

    if (!resume_path || typeof resume_path !== "string") {
      return createErrorResponse("Invalid request - resume_path required", 400);
    }

    // Verify the resume exists and belongs to a registration
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("id, resume_path")
      .eq("resume_path", resume_path)
      .single();

    if (regError || !registration) {
      return createErrorResponse("Resume not found", 404);
    }

    // Generate signed URL with 1 hour expiration
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(resume_path, 3600); // 1 hour expiration

    if (urlError || !signedUrlData) {
      console.error("Error creating signed URL:", urlError);
      return createErrorResponse("Failed to generate download URL", 500);
    }

    return createResponse({
      success: true,
      url: signedUrlData.signedUrl,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error in get-resume-url function:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
});

