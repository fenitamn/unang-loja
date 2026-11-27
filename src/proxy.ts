import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

/**
 * Proxy middleware:
 * 1. Mengarahkan URL tanpa prefix bahasa (mis. /admin/pesanan, /akun/pesanan/UL-...)
 *    ke locale default (/id/...) agar tidak menghasilkan 404.
 * 2. Meneruskan pathname asli ke Server Component via header x-ul-pathname.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Tangani jika endpoint /api tidak sengaja diawali prefix bahasa (mis. /id/api/... atau /en/api/...)
  if (/^\/(?:id|en)\/api(\/.*)?$/.test(pathname)) {
    const apiUrl = request.nextUrl.clone();
    apiUrl.pathname = pathname.replace(/^\/(?:id|en)/, "");
    return NextResponse.rewrite(apiUrl);
  }

  const isSupportedLocale = routing.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  );

  if (!isSupportedLocale) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${routing.defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ul-pathname", `${pathname}${search}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Jangan jalankan untuk API/static assets; route API punya guard sendiri.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\..*).*)"],
};
