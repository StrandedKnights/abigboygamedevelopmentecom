import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('❌ Missing required environment variable: PUBLIC_SUPABASE_URL. Server-side uploads will fail.');
}

if (!supabaseServiceKey) {
    throw new Error('❌ Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY. Server-side uploads will fail.');
}

/**
 * Highly privileged server-side Supabase client.
 * Bypasses Row Level Security (RLS). 
 * 
 * CRITICAL RULE: NEVER import this file into client-side components.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
