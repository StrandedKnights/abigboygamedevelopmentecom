import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Protect all /admin routes
  if (url.pathname.startsWith('/admin')) {
    // Exempt the login page itself
    if (url.pathname === '/admin/login') {
      return next();
    }
    
    // Check for the authentication cookie set by our login endpoint
    const token = cookies.get('adminToken')?.value;

    if (!token) {
      return redirect('/admin/login');
    }
  }

  // APIs handles their own exact bearer token validation
  // so we let API requests pass through the UI middleware
  return next();
});
