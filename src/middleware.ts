import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_POLLA = ["/polla/grupos", "/polla/reglas", "/polla/tabla", "/polla/entrada"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/polla")) {
    const isPublic = PUBLIC_POLLA.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (!isPublic && !request.cookies.get("mundial_user")) {
      const login = new URL("/cuenta/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (pathname.startsWith("/cuenta/perfil") && !request.cookies.get("mundial_user")) {
    return NextResponse.redirect(new URL("/cuenta/login?next=/cuenta/perfil", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/polla/:path*", "/cuenta/perfil"],
};
