// Supabase Edge Function to generate signed URLs for resume access
// This provides secure, time-limited access to resume files

// @ts-expect-error - Deno types are available in Supabase Edge Functions runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error - Deno ESM imports are available in Supabase Edge Functions runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetResumeUrlRequest {
  resume_path: string;
  admin_password?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // @ts-expect-error - Deno global is available in Supabase Edge Functions runtime
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // @ts-expect-error - Deno global is available in Supabase Edge Functions runtime
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
    // In production, implement proper Supabase Auth or service role verification
    const { admin_password, resume_path }: GetResumeUrlRequest = await req.json();
    
    // Basic admin password check (in production, use proper authentication)
    // @ts-expect-error - Deno global is available in Supabase Edge Functions runtime
    const expectedPassword = Deno.env.get("ADMIN_PASSWORD") || "admin123";
    
    if (admin_password !== expectedPassword && !authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If auth header is provided, verify Supabase Auth token (for future use)
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - Invalid token" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // resume_path already extracted above

    if (!resume_path || typeof resume_path !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request - resume_path required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the resume exists and belongs to a registration
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("id, resume_path")
      .eq("resume_path", resume_path)
      .single();

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: "Resume not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate signed URL with 1 hour expiration
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(resume_path, 3600); // 1 hour expiration

    if (urlError || !signedUrlData) {
      console.error("Error creating signed URL:", urlError);
      return new Response(
        JSON.stringify({ error: "Failed to generate download URL" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        url: signedUrlData.signedUrl,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-resume-url function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

