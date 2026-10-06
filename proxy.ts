import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast-path redirect only — presence of the cookie, not its signature.
 * The actual authorization boundary is server-side: lib/auth.ts's
 * requireAdmin() in every mutation, and isAdminAuthenticated() in
 * app/admin/layout.tsx for every page render.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies.has("creatvo_admin_session");
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
