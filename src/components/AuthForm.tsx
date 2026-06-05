"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Field, TextInput } from "@/components/ui/Field";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/polla/grupos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email, password }
            : { email, password, displayName },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = [data.error, data.hint].filter(Boolean).join(" ");
        throw new Error(msg || "Error");
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card-pitch mx-auto w-full max-w-md space-y-5 p-5 sm:p-8">
      <div className="text-center">
        <h1 className="font-display text-3xl text-cream">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Entra para pronosticar y unirte a grupos."
            : "Regístrate gratis y arma tu polla con amigos."}
        </p>
      </div>

      {mode === "register" && (
        <Field label="Tu nombre en la polla" hint="Así te verán tus amigos en el ranking">
          <TextInput
            required
            minLength={2}
            maxLength={32}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ej: Guille"
            autoComplete="nickname"
          />
        </Field>
      )}

      <Field label="Email">
        <TextInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
        />
      </Field>

      <Field label="Contraseña" hint={mode === "register" ? "Mínimo 6 caracteres" : undefined}>
        <TextInput
          type="password"
          required
          minLength={mode === "register" ? 6 : 1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Espera…" : mode === "login" ? "Entrar" : "Crear mi cuenta"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href={`/cuenta/registro?next=${encodeURIComponent(next)}`} className="text-lime underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href={`/cuenta/login?next=${encodeURIComponent(next)}`} className="text-lime underline">
              Inicia sesión
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
