import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "restaurant-super-secret-key-change-in-production-12345678",
  });
  const pathname = req.nextUrl.pathname;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin & Manager only areas
  if (
    (pathname.startsWith("/reports") || pathname.startsWith("/staff") || pathname.startsWith("/settings")) &&
    token.role !== "SUPER_ADMIN" &&
    token.role !== "ADMIN" &&
    token.role !== "MANAGER"
  ) {
    return NextResponse.redirect(new URL("/pos", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/pos/:path*",
    "/orders/:path*",
    "/menu/:path*",
    "/tables/:path*",
    "/reservations/:path*",
    "/inventory/:path*",
    "/staff/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
