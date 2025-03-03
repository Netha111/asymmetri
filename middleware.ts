import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware function to handle auth redirects
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is logged in and trying to access auth pages, redirect to home
    if (token) {
      if (path === "/login" || path === "/signup") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow access to login and signup pages when not authenticated
        if (req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/signup')) {
          return true;
        }
        // Protect chat API route
        if (req.nextUrl.pathname.startsWith('/api/chat')) {
          return !!token;
        }
        // Require authentication for all other non-API routes
        if (!req.nextUrl.pathname.startsWith('/api')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

// Update matcher to include chat API route
export const config = {
  matcher: [
    /*
     * Match all paths including login, signup, and chat API
     * Exclude other API routes and Next.js internals
     */
    '/((?!api/auth|api/signup|_next/static|_next/image|favicon.ico).*)',
    '/api/chat/:path*'
  ],
}; 