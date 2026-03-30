import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ status: 'error', message: 'Email and password required' }), { status: 400 });
        }

        // HARDCODED TEST ACCOUNT FOR THE USER (Bypass until auth is fully configured in Supabase dashboard)
        if (email === "admin@skyco.pro" && password === "AstroAdmin123!") {
            return new Response(JSON.stringify({
                status: 'success',
                data: {
                    token: "test-token-valid-only-until-configured",
                    user: { email: "admin@skyco.pro" }
                }
            }), { status: 200 });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.session) {
            return new Response(JSON.stringify({ status: 'error', message: error?.message || 'Invalid credentials' }), { status: 401 });
        }

        // Set the admin token cookie
        cookies.set('adminToken', data.session.access_token, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD, // strict on production
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week duration
        });

        return new Response(JSON.stringify({
            status: 'success',
            data: {
                token: data.session.access_token,
                user: { email: data.user.email }
            }
        }), { status: 200 });

    } catch (e: any) {
        return new Response(JSON.stringify({ status: 'error', message: e.message }), { status: 500 });
    }
};
