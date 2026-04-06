import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
    // Clear the session cookie
    cookies.delete('admin_session', { path: '/' });
    
    // API requests return JSON, standard requests could redirect, but our frontend currently calls this via JS or href
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
};
