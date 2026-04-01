import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED = ["/account", "/host", "/bookings"];
// Routes only for unauthenticated users
const AUTH_ONLY = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const role  = request.cookies.get("auth-role")?.value;
  const { pathname } = request.nextUrl;

  // Unauthenticated → login
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated GUEST trying to access host-only routes → not authorized
  if (pathname.startsWith("/host") && token && role !== "HOST") {
    return NextResponse.redirect(new URL("/not-authorized", request.url));
  }

  // Already logged in → skip auth pages
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
