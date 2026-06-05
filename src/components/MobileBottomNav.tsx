"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/calendario", label: "Calendario", icon: "📅" },
  { href: "/polla", label: "Polla", icon: "⚽" },
  { href: "/polla/tabla", label: "Tabla", icon: "📊" },
  { href: "/cuenta/perfil", label: "Perfil", icon: "👤" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  function active(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/polla") return pathname === "/polla";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-pitch-mid/60 bg-pitch/95 backdrop-blur-md md:hidden safe-bottom"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.href}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] ${
                active(item.href) ? "text-lime" : "text-muted"
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
