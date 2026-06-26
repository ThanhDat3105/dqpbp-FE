import { type NextRequest, NextResponse } from "next/server";

const WEBSITE_HOSTS = new Set(["bchqsbp.vn", "www.bchqsbp.vn"]);

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  const { pathname } = request.nextUrl;

  if (!host || !WEBSITE_HOSTS.has(host)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/website" || pathname.startsWith("/website/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/website/, "") || "/";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/website" : `/website${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
