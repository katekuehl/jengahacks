declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        toObject(): { [key: string]: string };
    }

    export const env: Env;

    export function exit(code?: number): void;
}

// Add other Deno-specific globals if needed
// For Supabase Edge Functions, Deno.env is the most commonly used global.

declare module "https://*" {
    const value: any;
    export default value;
    export const serve: any;
    export const createClient: any;
    export const handleCORS: any;
    export const createResponse: any;
    export const createErrorResponse: any;
}

declare module "http://*" {
    const value: any;
    export default value;
}
