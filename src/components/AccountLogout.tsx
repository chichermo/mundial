"use client";

import { useRouter } from "next/navigation";

export function AccountLogout() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="btn-ghost text-sm">
      Cerrar sesión
    </button>
  );
}
