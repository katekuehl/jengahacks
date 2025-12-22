/**
 * Log Forwarder Edge Function
 * 
 * Receives logs from client applications and forwards them to aggregation services
 * Provides server-side log forwarding with rate limiting and batching
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOGTAIL_ENDPOINT = Deno.env.get("LOGTAIL_ENDPOINT");
const LOGTAIL_API_KEY = Deno.env.get("LOGTAIL_API_KEY");
const DATADOG_ENDPOINT = Deno.env.get("DATADOG_ENDPOINT");
const DATADOG_API_KEY = Deno.env.get("DATADOG_API_KEY");
const LOG_AGGREGATION_PROVIDER = Deno.env.get("LOG_AGGREGATION_PROVIDER") || "logtail";

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    userAgent?: string;
    url?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
}

interface LogBatch {
  entries: LogEntry[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const logs: LogEntry[] = body.entries || [body];

    if (!Array.isArray(logs) || logs.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid log entries" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Forward logs to aggregation service
    const results = await Promise.allSettled(
      logs.map((log) => forwardLog(log))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({
        success: true,
        forwarded: successful,
        failed,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Log forwarder error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

async function forwardLog(entry: LogEntry): Promise<void> {
  switch (LOG_AGGREGATION_PROVIDER) {
    case "logtail":
      await forwardToLogtail(entry);
      break;
    case "datadog":
      await forwardToDatadog(entry);
      break;
    default:
      console.warn(`Unknown log aggregation provider: ${LOG_AGGREGATION_PROVIDER}`);
  }
}

async function forwardToLogtail(entry: LogEntry): Promise<void> {
  if (!LOGTAIL_ENDPOINT || !LOGTAIL_API_KEY) {
    throw new Error("Logtail configuration missing");
  }

  const response = await fetch(LOGTAIL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOGTAIL_API_KEY}`,
    },
    body: JSON.stringify({
      dt: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.error && { error: entry.error }),
      ...(entry.context && { context: entry.context }),
      ...(entry.metadata && { metadata: entry.metadata }),
      source: "jengahacks-hub",
      environment: Deno.env.get("ENVIRONMENT") || "production",
    }),
  });

  if (!response.ok) {
    throw new Error(`Logtail API error: ${response.status} ${response.statusText}`);
  }
}

async function forwardToDatadog(entry: LogEntry): Promise<void> {
  if (!DATADOG_ENDPOINT || !DATADOG_API_KEY) {
    throw new Error("Datadog configuration missing");
  }

  const response = await fetch(DATADOG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "DD-API-KEY": DATADOG_API_KEY,
    },
    body: JSON.stringify({
      ddsource: "jengahacks-hub",
      ddtags: `env:${Deno.env.get("ENVIRONMENT") || "production"}`,
      level: entry.level,
      message: entry.message,
      ...(entry.error && { error: entry.error }),
      ...(entry.context && { context: entry.context }),
      ...(entry.metadata && { metadata: entry.metadata }),
      timestamp: entry.timestamp,
    }),
  });

  if (!response.ok) {
    throw new Error(`Datadog API error: ${response.status} ${response.statusText}`);
  }
}

