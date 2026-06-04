"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyInviteCode } from "@/components/CopyInviteCode";
import { ProgressRing } from "@/components/ui/ProgressRing";

type Membership = {
  memberId: string;
  memberCount: number;
  predictionsCount: number;
} | null;

type Props = {
  groupName: string;
  groupCode: string;
  memberCount: number;
  membership: Membership;
  isActive: boolean;
  userName: string;
};

export function BalsuosPollaHub({
  groupName,
  groupCode,
  memberCount,
  membership,
  isActive,
  userName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeInput, setCodeInput] = useState(groupCode);

  const pct = membership
    ? Math.min(100, Math.round((membership.predictionsCount / 72) * 100))
    : 0;

  async function joinBalsuos() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/polla/groups/balsuos/join", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo unir");
      router.push("/polla");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function joinWithCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/polla/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.toUpperCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/polla");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-center text-sm text-muted sm:text-left">
        Hola, <span className="font-semibold text-lime">{userName}</span>. Esta es la polla
        única del grupo de amigos.
      </p>

      <div className="card-pitch overflow-hidden">
        <div className="border-b border-pitch-mid/40 bg-gradient-to-r from-lime/10 to-gold/5 px-5 py-6 text-center sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Polla oficial</p>
          <h2 className="mt-2 font-display text-4xl text-gradient-gold sm:text-5xl">
            {groupName}
          </h2>
          <p className="mt-2 text-sm text-muted">{memberCount} jugadores inscritos</p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <CopyInviteCode code={groupCode} />

          {membership ? (
            <>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-pitch/50 px-4 py-3">
                <div>
                  <p className="text-xs text-muted">Tu progreso (fase grupos)</p>
                  <p className="font-display text-2xl text-lime">{pct}%</p>
                </div>
                <ProgressRing pct={pct} size={56} />
              </div>
              <Link
                href="/polla"
                className={`btn-primary block w-full text-center ${isActive ? "" : ""}`}
              >
                {isActive ? "Ir a mis pronósticos" : "Entrar a la polla"}
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={joinBalsuos}
                disabled={loading}
                className="btn-primary w-full text-base"
              >
                {loading ? "Uniéndote…" : `Unirme a ${groupName}`}
              </button>
              <p className="text-center text-xs text-muted">
                Un clic y ya estás dentro. No necesitas crear otro grupo.
              </p>
            </>
          )}

          <details className="rounded-xl border border-pitch-mid/50 bg-pitch/30">
            <summary className="cursor-pointer px-4 py-3 text-sm text-muted hover:text-cream">
              ¿El código no funciona? Ingrésalo manualmente
            </summary>
            <form onSubmit={joinWithCode} className="space-y-3 border-t border-pitch-mid/40 p-4">
              <input
                type="text"
                maxLength={6}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-pitch-mid bg-pitch px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-cream uppercase"
                aria-label="Código del grupo"
              />
              <button type="submit" disabled={loading} className="btn-ghost w-full text-sm">
                Validar código
              </button>
            </form>
          </details>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
