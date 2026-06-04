import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-pitch-mid/40 bg-pitch-light/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-3 py-8 text-center text-xs text-muted safe-bottom sm:flex-row sm:flex-wrap sm:justify-between sm:text-left md:px-8">
        <p className="max-w-xs sm:max-w-none">WE26 · Mundial 2026 · Canadá · México · USA</p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end">
          <Link href="/polla/reglas" className="hover:text-lime">
            Reglas polla
          </Link>
          <Link href="/calendario" className="hover:text-lime">
            Calendario
          </Link>
          <Link href="/polla/grupos" className="hover:text-lime">
            Mis grupos
          </Link>
          <Link href="/cuenta/perfil" className="hover:text-lime">
            Perfil
          </Link>
        </nav>
      </div>
    </footer>
  );
}
