import { type NextRequest, NextResponse } from "next/server";

const publicPages = [{ path: "/login", redirectWhenLoggedIn: "/" }];

export function middleware(request: NextRequest) {
  const isUserLoggedIn = !!request.cookies.get("auth");
  const requestPath = request.nextUrl.pathname;
  const publicPage = publicPages.find((page) => page.path === requestPath);

  if (!publicPage && !isUserLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (publicPage?.redirectWhenLoggedIn && isUserLoggedIn) {
    return NextResponse.redirect(
      new URL(publicPage.redirectWhenLoggedIn, request.url),
    );
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
