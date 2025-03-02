import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  // const isPublicPath = path === "/signin" || path === "/signup" || path === "/";
  
  // Define protected paths that require authentication
  // We're excluding /create from the protected paths for now to avoid redirect loops
  const isProtectedPath = path.startsWith("/posts/");
  
  // Check for authentication token in cookies
  const authCookie = request.cookies.get("next-auth.session-token");
  const isAuthenticated = !!authCookie;
  
  // Redirect to signin if trying to access a protected route without authentication
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  
  // Redirect to home if already authenticated and trying to access signin/signup
  if ((path === "/signin" || path === "/signup") && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // Allow all other requests to proceed
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    "/posts/:path*",
    "/signin",
    "/signup"
  ],
}; 