import { NextResponse, type NextRequest } from "next/server";

/**
 * Meneruskan pathname asli ke Server Component.
 *
 * Layout tidak menerima `pathname`, sedangkan halaman login membutuhkan
 * tujuan asli (`?next=`). Header ini hanya berisi path internal yang dibuat
 * oleh Next.js, bukan input pengguna yang dipercaya begitu saja.
 *
 * Pemeriksaan sesi tetap dilakukan di server (layout/route handler), bukan
 * hanya mengandalkan Proxy.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-ul-pathname",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Jangan jalankan untuk API/static assets; route API punya guard sendiri.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
