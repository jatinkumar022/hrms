// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const isPublicPath = PUBLIC_PATHS.includes(path);

  // If not authenticated and trying to access protected page → redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If authenticated and trying to access login/signup → redirect to dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Match all paths EXCEPT:
      - Next.js internals (_next)
      - static assets (favicon, images)
      - API routes (/api/**)
    */
    "/((?!api|_next|.*\\..*|favicon.ico).*)",
  ],
};
