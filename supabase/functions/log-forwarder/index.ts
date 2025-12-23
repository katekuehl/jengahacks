import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCORS, createResponse, createErrorResponse } from "../_shared/utils.ts";

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

serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createErrorResponse("Missing authorization header", 401);
    }

    // Parse request body
    const body = await req.json();
    const logs: LogEntry[] = body.entries || [body];

    if (!Array.isArray(logs) || logs.length === 0) {
      return createErrorResponse("Invalid log entries", 400);
    }

    // Forward logs to aggregation service
    const results = await Promise.allSettled(
      logs.map((log) => forwardLog(log))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return createResponse({
      success: true,
      forwarded: successful,
      failed,
    });
  } catch (error) {
    console.error("Log forwarder error:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
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

