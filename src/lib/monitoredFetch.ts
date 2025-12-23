
import { monitor } from './monitoring';

/**
 * A wrapper around window.fetch that tracks response times and errors.
 * This is used to instrument the Supabase client.
 */
export const monitoredFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> => {
    const start = performance.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Extract endpoint for cleaner metrics (remove query params)
    let endpoint = url;
    try {
        const urlObj = new URL(url);
        endpoint = urlObj.pathname;
    } catch {
        // If not a valid URL (e.g. relative path), keep as is
    }

    try {
        const response = await fetch(input, init);
        const duration = performance.now() - start;

        monitor.trackApiResponseTime(endpoint, duration, response.ok);

        return response;
    } catch (error) {
        const duration = performance.now() - start;

        // Log network errors
        monitor.trackApiResponseTime(endpoint, duration, false);

        if (error instanceof Error) {
            monitor.trackError(error, { context: 'monitoredFetch', endpoint, duration });
        }

        throw error;
    }
};
