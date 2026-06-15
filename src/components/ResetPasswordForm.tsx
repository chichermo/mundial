"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, TextInput } from "@/components/ui/Field";

export function ResetPasswordForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, groupCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo cambiar la contraseña");
      }
      setSuccess(true);
      setTimeout(() => router.push("/cuenta/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card-pitch mx-auto w-full max-w-md space-y-4 p-5 text-center sm:p-8">
        <h1 className="font-display text-2xl text-lime">Contraseña actualizada</h1>
        <p className="text-sm text-muted">Redirigiendo al inicio de sesión…</p>
        <Link href="/cuenta/login" className="btn-primary inline-block">
          Entrar ahora
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-pitch mx-auto w-full max-w-md space-y-5 p-5 sm:p-8">
      <div className="text-center">
        <h1 className="font-display text-3xl text-cream">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-muted">
          Usa tu email o nombre en la polla y el código del grupo. Sin correos ni enlaces.
        </p>
      </div>

      <Field label="Email o nombre en la polla" hint="Ej: alexis o tu@email.com">
        <TextInput
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Alexis"
          autoComplete="username"
        />
      </Field>

      <Field label="Código del grupo" hint="El código que compartió el organizador (ej. BALSUO)">
        <TextInput
          required
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
          placeholder="BALSUO"
          maxLength={6}
          autoComplete="off"
        />
      </Field>

      <Field label="Nueva contraseña" hint="Mínimo 6 caracteres">
        <TextInput
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </Field>

      <Field label="Repetir contraseña">
        <TextInput
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Guardando…" : "Cambiar contraseña"}
      </button>

      <p className="text-center text-sm text-muted">
        <Link href="/cuenta/login" className="text-lime underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
