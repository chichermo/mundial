"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput } from "@/components/ui/Field";

type Props = {
  email: string;
  displayName: string;
  notifyMatchReminders: boolean;
};

export function ProfileForm({ email, displayName, notifyMatchReminders }: Props) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [notify, setNotify] = useState(notifyMatchReminders);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("Guardando…");
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, notifyMatchReminders: notify }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error");
      setStatus("");
      return;
    }
    setStatus("Perfil actualizado");
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("Cambiando contraseña…");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error");
      setStatus("");
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setStatus("Contraseña cambiada");
  }

  return (
    <div className="mx-auto grid max-w-lg gap-8">
      <form onSubmit={saveProfile} className="card-pitch space-y-5 p-6">
        <h2 className="font-display text-xl text-gold">Tu perfil</h2>
        <Field label="Email">
          <TextInput value={email} disabled className="opacity-60" />
        </Field>
        <Field label="Nombre en la polla" hint="Se actualiza en todos tus grupos">
          <TextInput
            required
            minLength={2}
            maxLength={32}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-pitch-mid/60 bg-pitch/40 px-4 py-3">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-5 w-5 rounded border-pitch-mid accent-lime"
          />
          <span className="text-sm">
            <strong className="text-cream">Recordatorios</strong>
            <span className="block text-xs text-muted">
              Aviso en el navegador si faltan pronósticos 48 h antes de un partido
            </span>
          </span>
        </label>
        <button type="submit" className="btn-primary w-full">
          Guardar perfil
        </button>
      </form>

      <form onSubmit={savePassword} className="card-pitch space-y-5 p-6">
        <h2 className="font-display text-xl text-gold">Cambiar contraseña</h2>
        <Field label="Contraseña actual">
          <TextInput
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <Field label="Nueva contraseña" hint="Mínimo 6 caracteres">
          <TextInput
            type="password"
            minLength={6}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <button type="submit" className="btn-ghost w-full">
          Actualizar contraseña
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {status && <p className="text-sm text-lime">{status}</p>}
    </div>
  );
}
