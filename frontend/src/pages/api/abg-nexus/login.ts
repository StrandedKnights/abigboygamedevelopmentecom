import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Simple in-memory rate limiter for login attempts.
 * Tracks failed attempts per IP. Resets after the window expires.
 */
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry) return false;

    // Reset window if expired
    if (now - entry.firstAttempt > WINDOW_MS) {
        loginAttempts.delete(ip);
        return false;
    }

    return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry || now - entry.firstAttempt > WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
    } else {
        entry.count++;
    }
}

function clearAttempts(ip: string): void {
    loginAttempts.delete(ip);
}

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
    try {
        const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';

        // SEC-3 FIX: Rate limiting
        if (isRateLimited(ip)) {
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Te veel inlogpogingen. Probeer het over een minuut opnieuw.'
            }), { status: 429 });
        }

        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ status: 'error', message: 'Email and password required' }), { status: 400 });
        }

        // SEC-1 FIX: Removed ALL hardcoded password bypasses.
        // Authentication is now exclusively handled by Supabase Auth.
        // To create an admin account, add a user via the Supabase Dashboard:
        //   → Authentication → Users → Add User

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.session) {
            recordFailedAttempt(ip);
            return new Response(JSON.stringify({ status: 'error', message: 'Ongeldige inloggegevens' }), { status: 401 });
        }

        // SEC-2 FIX: Use the cryptographically signed Supabase JWT as session token.
        // This token is verifiable server-side via Supabase's getUser() method.
        cookies.set('admin_session', data.session.access_token, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours TTL
        });

        // Also store refresh token for session renewal
        cookies.set('admin_refresh', data.session.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        clearAttempts(ip);

        return new Response(JSON.stringify({
            status: 'success',
            message: 'Logged in successfully'
        }), { status: 200 });

    } catch (e: any) {
        // SEC-8 FIX: Generic error message to client, detailed error stays server-side
        console.error('[Admin Login Error]:', e.message);
        return new Response(JSON.stringify({ status: 'error', message: 'Er is iets misgegaan. Probeer het later opnieuw.' }), { status: 500 });
    }
};
