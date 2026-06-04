"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CopyInviteCode } from "@/components/CopyInviteCode";
import { Field, TextInput } from "@/components/ui/Field";
import { ProgressRing } from "@/components/ui/ProgressRing";

export type GroupItem = {
  memberId: string;
  groupId: string;
  groupName: string;
  groupCode: string;
  memberCount: number;
  ownerName: string | null;
  isOwner: boolean;
  predictionsCount: number;
};

type Props = {
  groups: GroupItem[];
  activeMemberId?: string;
  userName: string;
};

type Tab = "mine" | "create" | "join";

export function GroupsHub({ groups, activeMemberId, userName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("mine");
  const [groupName, setGroupName] = useState("");
  const [code, setCode] = useState(searchParams.get("unirse")?.toUpperCase() ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("unirse")) setTab("join");
  }, [searchParams]);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/polla/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName }),
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

  async function joinGroup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/polla/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() }),
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

  async function enterGroup(memberId: string) {
    setLoading(true);
    const res = await fetch("/api/polla/groups/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/polla");
      router.refresh();
    }
  }

  const owned = groups.filter((g) => g.isOwner);

  return (
    <div className="space-y-8">
      <p className="text-muted">
        Hola, <span className="font-semibold text-lime">{userName}</span>. Elige un grupo o crea
        uno nuevo e invita con el código.
      </p>

      <div className="flex flex-col gap-1 rounded-xl bg-pitch-light p-1 sm:flex-row sm:flex-wrap sm:gap-2">
        {(
          [
            ["mine", "Mis grupos", "Grupos"],
            ["create", "Crear grupo", "Crear"],
            ["join", "Unirme con código", "Unirme"],
          ] as const
        ).map(([id, label, short]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-[44px] flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:min-w-[100px] sm:px-4 ${
              tab === id ? "bg-lime text-ink" : "text-muted hover:text-cream"
            }`}
          >
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "mine" && (
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="card-pitch border-dashed p-6 text-center sm:p-10">
              <p className="font-display text-xl text-cream">Aún no tienes grupos</p>
              <p className="mt-2 text-sm text-muted">
                Crea el primero o pide el código a quien ya armó la polla.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                <button type="button" onClick={() => setTab("create")} className="btn-primary text-sm">
                  Crear grupo
                </button>
                <button type="button" onClick={() => setTab("join")} className="btn-ghost text-sm">
                  Tengo un código
                </button>
              </div>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {groups.map((g) => {
                const pct = Math.min(100, Math.round((g.predictionsCount / 72) * 100));
                const isActive = g.memberId === activeMemberId;
                return (
                  <li
                    key={g.memberId}
                    className={`card-pitch p-5 transition-all ${
                      isActive ? "ring-2 ring-lime/50" : "hover:border-lime/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl text-cream">{g.groupName}</p>
                        <p className="text-xs text-muted">
                          {g.memberCount} jugadores
                          {g.isOwner && (
                            <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-gold">
                              Admin
                            </span>
                          )}
                        </p>
                        {g.ownerName && !g.isOwner && (
                          <p className="mt-1 text-xs text-muted">Creado por {g.ownerName}</p>
                        )}
                      </div>
                      <ProgressRing pct={pct} label={`${pct}%`} />
                    </div>
                    {g.isOwner && <CopyInviteCode code={g.groupCode} />}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => enterGroup(g.memberId)}
                      className={`mt-4 w-full ${isActive ? "btn-ghost" : "btn-primary"} text-sm`}
                    >
                      {isActive ? "Grupo activo — Ir a pronósticos" : "Entrar a este grupo"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {owned.length > 0 && (
            <p className="text-xs text-muted">
              Tip: comparte el código o el botón &quot;Copiar invitación&quot; para que tus amigos
              se registren y se unan desde &quot;Unirme con código&quot;.
            </p>
          )}
        </div>
      )}

      {tab === "create" && (
        <form onSubmit={createGroup} className="card-pitch mx-auto w-full max-w-md space-y-5 p-5 sm:p-8">
          <h2 className="font-display text-2xl text-gold">Nueva polla</h2>
          <Field label="Nombre del grupo" hint="Ej: Oficina, Universidad, Familia">
            <TextInput
              required
              minLength={3}
              maxLength={40}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Los del curso"
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creando…" : "Crear y empezar a pronosticar"}
          </button>
        </form>
      )}

      {tab === "join" && (
        <form onSubmit={joinGroup} className="card-pitch mx-auto w-full max-w-md space-y-5 p-5 sm:p-8">
          <h2 className="font-display text-2xl text-gold">Unirme a un grupo</h2>
          <Field label="Código de 6 caracteres">
            <TextInput
              required
              minLength={6}
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono text-xl tracking-[0.25em] uppercase"
              placeholder="ABC123"
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Uniendo…" : "Unirme al grupo"}
          </button>
          <p className="text-center text-xs text-muted">
            ¿No tienes código?{" "}
            <Link href="/cuenta/registro" className="text-lime underline">
              Crea tu cuenta
            </Link>{" "}
            y pide invitación al admin del grupo.
          </p>
        </form>
      )}
    </div>
  );
}
