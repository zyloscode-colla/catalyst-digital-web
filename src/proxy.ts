import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CMS_SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/cms/service";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, Next internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(CMS_SESSION_COOKIE)?.value;
  const session = sessionCookie ? decodeSession(sessionCookie) : null;
  const isAuthenticated = Boolean(session);

  // 2. Protect Admin Panel Routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Check Platform Maintenance Mode for Public Routes
  // Allow authenticated admin users to bypass maintenance mode and preview the site
  if (!isAuthenticated && pathname !== "/maintenance") {
    try {
      const settings = await getSiteSettings();
      if (settings.maintenanceMode) {
        return NextResponse.rewrite(new URL("/maintenance", request.url));
      }
    } catch {
      // Fallback cleanly if checking fails
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
