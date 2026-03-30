import { createClient } from '@supabase/supabase-js';
import { SECRETS } from './secrets';

const supabaseUrl = SECRETS.SUPABASE_URL();
const supabaseServiceKey = SECRETS.SUPABASE_SERVICE_KEY();

if (!supabaseUrl || !supabaseServiceKey) {
   // Local dev warning only if envs and secrets are missing
   console.warn("⚠️ [Supabase Admin] Missing required connection strings or service role keys. Server-side features like image uploads or account creation will fail without either .env configuration OR Docker Secrets.");
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
