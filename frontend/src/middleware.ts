import { defineMiddleware } from 'astro/middleware';
import { createClient } from '@supabase/supabase-js';

/**
 * SEC-5 FIX: Server-side session validation.
 * The middleware now verifies the JWT token via Supabase's getUser() method
 * instead of just checking if a cookie value exists.
 */

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

async function verifySession(token: string): Promise<boolean> {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });
        const { data, error } = await supabase.auth.getUser(token);
        return !error && !!data.user;
    } catch {
        return false;
    }
}

export const onRequest = defineMiddleware(async (context, next) => {
    const url = new URL(context.request.url);

    // Identifiers for protected paths
    const isAdminPath = url.pathname.startsWith('/abg-nexus');
    const isAdminApi = url.pathname.startsWith('/api/abg-nexus');
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(context.request.method);

    // SEC-6 FIX: CSRF Protection
    if (isAdminApi && isStateChanging) {
        const origin = context.request.headers.get('Origin');
        const referer = context.request.headers.get('Referer');
        const expectedOrigin = new URL(context.request.url).origin;
        const publicUrl = import.meta.env.FRONTEND_URL || import.meta.env.PUBLIC_URL;
        
        // Basic origin/referer check (must match current site or the public URL)
        const isSelfMatch = 
            (origin && (origin === expectedOrigin || (publicUrl && origin.startsWith(publicUrl)))) || 
            (referer && (referer.startsWith(expectedOrigin) || (publicUrl && referer.startsWith(publicUrl))));
        
        if (!isSelfMatch) {
            console.error(`[Security] CSRF Blocked: ${context.request.method} ${url.pathname} from origin: ${origin}, referer: ${referer}. Expected: ${expectedOrigin} or ${publicUrl}`);
            return new Response(JSON.stringify({ error: "Forbidden: CSRF verification failed" }), { status: 403 });
        }
    }
    
    // Check if user is navigating toward admin or admin-api
    if (isAdminPath || isAdminApi) {
        const sessionCookie = context.cookies.get('admin_session');
        const gateAuthCookie = context.cookies.get('admin_gate_authorized');
        
        // 1. If they have a session cookie, VERIFY it (SEC-5 FIX)
        if (sessionCookie && sessionCookie.value) {
            const isValid = await verifySession(sessionCookie.value);
            
            if (isValid) {
                return next(); // Verified session — allow access
            }
            
            // Invalid/expired token — clear the stale cookie
            context.cookies.delete('admin_session', { path: '/' });
            context.cookies.delete('admin_refresh', { path: '/' });
            
            // For API requests, return 401
            if (isAdminApi) {
                return new Response(JSON.stringify({ error: 'Session expired' }), { status: 401 });
            }
            // For page requests, redirect to login
            if (gateAuthCookie && gateAuthCookie.value === 'true') {
                return context.redirect('/abg-nexus/login');
            }
            // Fall through to gate check below
        }

        // 2. Gateway logic for unauthenticated users
        const providedKey = url.searchParams.get('key');
        const secretKey = import.meta.env.ADMIN_GATEWAY_KEY;

        // SEC-4 FIX: No hardcoded fallback. If ADMIN_GATEWAY_KEY env var is not set, deny all access.
        if (!secretKey) {
            console.error('[Middleware] ADMIN_GATEWAY_KEY env var is not set. Admin access is disabled.');
            return new Response("Not Found", { status: 404 });
        }

        if (providedKey === secretKey) {
            // Set a gate-authorized cookie (2-hour window to complete login)
            context.cookies.set('admin_gate_authorized', 'true', {
                path: '/',
                httpOnly: true,
                secure: import.meta.env.PROD,
                sameSite: 'strict',
                maxAge: 60 * 60 * 2 // 2 hours window to login
            });
            // Strip the key from the URL to avoid it staying in browser history
            url.searchParams.delete('key');
            return context.redirect(url.pathname);
        }

        // 3. No session AND no key AND no gate cookie → pretend page doesn't exist
        if (!gateAuthCookie || gateAuthCookie.value !== 'true') {
            return new Response("Not Found", { status: 404 });
        }

        // 4. Gate cookie exists but no session → only allow login page
        const allowedPaths = ['/abg-nexus/login', '/api/abg-nexus/login'];
        if (!allowedPaths.includes(url.pathname)) {
            if (isAdminApi) {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
            }
            return context.redirect('/abg-nexus/login');
        }
    }

    return next();
});
