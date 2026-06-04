"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card-pitch mx-auto max-w-sm space-y-4 p-6">
      <h1 className="font-display text-2xl text-gold">Admin WE26</h1>
      <p className="text-xs text-muted">Carga resultados reales y respuestas de la polla.</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña admin"
        className="w-full rounded-lg border border-pitch-mid bg-pitch px-3 py-2 text-cream"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        Entrar
      </button>
    </form>
  );
}
