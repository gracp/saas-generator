import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isApiProtected = request.nextUrl.pathname.startsWith("/api/");

  if (isDashboard && !token) {
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
