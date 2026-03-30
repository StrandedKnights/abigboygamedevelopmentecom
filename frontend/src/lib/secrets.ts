import fs from 'fs';
import path from 'path';

/**
 * Utility to safely retrieve sensitive credentials.
 * It first checks for standard Environment Variables, then falls back to 
 * Docker Secrets (/run/secrets/[KEY]).
 */
export function getSecret(key: string): string | undefined {
    // 1. Check for standard Environment Variable first (Local dev)
    const envVal = import.meta.env ? import.meta.env[key] : process.env[key];
    if (envVal) return envVal;

    // 2. Check for Docker Secret file (/run/secrets/[KEY]) in production
    const secretPath = path.join('/run', 'secrets', key);
    
    // Check if running on Linux/Docker (using fs.existsSync)
    if (typeof window === 'undefined' && fs.existsSync(secretPath)) {
        try {
            return fs.readFileSync(secretPath, 'utf8').trim();
        } catch (e) {
            console.error(`❌ Docker Secret Error [${key}]:`, e);
        }
    }

    return undefined;
}

/**
 * Standard Keys used throughout the application.
 */
export const SECRETS = {
    DATABASE_URL: () => getSecret('DATABASE_URL'),
    DIRECT_URL: () => getSecret('DIRECT_URL'),
    SUPABASE_URL: () => getSecret('PUBLIC_SUPABASE_URL') || getSecret('SUPABASE_URL'),
    SUPABASE_ANON_KEY: () => getSecret('PUBLIC_SUPABASE_ANON_KEY') || getSecret('SUPABASE_KEY'),
    SUPABASE_SERVICE_KEY: () => getSecret('SUPABASE_SERVICE_ROLE_KEY'),
    FRONTEND_URL: () => getSecret('FRONTEND_URL'),
    PUBLIC_API_URL: () => getSecret('PUBLIC_API_URL'),
    MOLLIE_API_KEY: () => getSecret('MOLLIE_API_KEY'),
};
