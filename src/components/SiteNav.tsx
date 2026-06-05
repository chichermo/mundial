"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { PollaSession, UserSession } from "@/lib/session";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/calendario", label: "Calendario" },
  { href: "/polla/grupos", label: "Polla" },
];

type Props = {
  user: UserSession | null;
  polla: PollaSession | null;
};

export function SiteNav({ user, polla }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function pollaHref() {
    if (!user) return "/cuenta/login?next=/polla";
    return polla ? "/polla" : "/polla/grupos";
  }

  function isActive(linkHref: string) {
    return pathname === linkHref || (linkHref !== "/" && pathname.startsWith(`${linkHref}/`));
  }

  const navLinkClass = (active: boolean) =>
    `block rounded-xl px-4 py-3 text-base font-medium transition-colors min-h-[44px] flex items-center ${
      active ? "bg-lime/15 text-lime" : "text-cream hover:bg-pitch-mid/50"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-pitch-mid/50 bg-pitch/95 backdrop-blur-md safe-top">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 md:gap-4 md:px-8 md:py-3">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-base font-bold text-lime ring-1 ring-lime/30 sm:h-11 sm:w-11 sm:text-lg"
            aria-hidden
          >
            26
          </span>
          <div className="min-w-0 sm:block">
            <p className="font-display text-xl leading-none text-gradient-gold sm:text-2xl">WE26</p>
            <p className="hidden text-[10px] uppercase tracking-widest text-muted min-[400px]:block">
              Mundial · Polla
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((link) => {
            const href = link.href === "/polla/grupos" ? pollaHref() : link.href;
            const active =
              link.href === "/polla/grupos"
                ? pathname.startsWith("/polla")
                : isActive(link.href);
            return (
              <Link
                key={link.href}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-lime/15 text-lime" : "text-muted hover:bg-pitch-mid/50 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {polla && (
                <span className="hidden max-w-[100px] truncate rounded-lg bg-pitch-mid/60 px-2 py-1 text-[10px] text-muted lg:inline xl:max-w-[140px]">
                  {polla.groupName}
                </span>
              )}
              <Link
                href="/cuenta/perfil"
                className="hidden text-sm text-muted hover:text-lime lg:inline"
              >
                Perfil
              </Link>
              <Link
                href="/polla/grupos"
                className="hidden items-center gap-2 rounded-xl border border-pitch-mid px-2 py-1.5 transition-colors hover:border-lime/40 sm:flex md:px-3 md:py-2"
                aria-label={`Cuenta de ${user.displayName}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime/20 font-display text-sm text-lime md:h-8 md:w-8">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[88px] truncate font-medium text-cream lg:inline">
                  {user.displayName}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/cuenta/login"
                className="btn-ghost hidden !min-h-10 !px-3 text-sm sm:inline-flex md:!px-4"
              >
                Entrar
              </Link>
              <Link href="/cuenta/registro" className="btn-primary !min-h-10 !px-3 text-sm md:!px-4">
                Registro
              </Link>
            </>
          )}

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-pitch-mid text-cream md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-ink/60 md:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="fixed inset-x-0 top-[3.25rem] z-50 max-h-[calc(100dvh-3.25rem)] overflow-y-auto border-b border-pitch-mid bg-pitch-light px-3 py-4 shadow-2xl md:hidden safe-bottom"
            aria-label="Menú móvil"
          >
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const href =
                  link.href === "/polla/grupos" ? pollaHref() : link.href;
                const active =
                  link.href === "/polla/grupos"
                    ? pathname.startsWith("/polla")
                    : isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={href}
                    className={navLinkClass(active)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {user ? (
                <>
                  <Link
                    href="/polla/grupos"
                    className={navLinkClass(pathname.startsWith("/polla/grupos"))}
                    onClick={() => setMenuOpen(false)}
                  >
                    Polla Balsuos
                    {polla && (
                      <span className="ml-2 truncate text-xs text-muted">· {polla.groupName}</span>
                    )}
                  </Link>
                  <Link
                    href="/cuenta/perfil"
                    className={navLinkClass(pathname === "/cuenta/perfil")}
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/polla/reglas"
                    className={navLinkClass(pathname === "/polla/reglas")}
                    onClick={() => setMenuOpen(false)}
                  >
                    Reglas de la polla
                  </Link>
                </>
              ) : (
                <Link
                  href="/cuenta/login"
                  className={navLinkClass(false)}
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
