"use client";

import { useCallback, useEffect, useRef } from "react";

const CHECK_MS = 5 * 60 * 1000;
const STORAGE_KEY = "we26_last_notify";

type Pending = { id: number; home: string; away: string; urgent?: boolean };

export function PredictionReminders() {
  const notifiedRef = useRef<Set<number>>(new Set());
  const urgentRef = useRef<Set<number>>(new Set());

  const check = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const res = await fetch("/api/polla/reminders");
    if (!res.ok) return;
    const data = (await res.json()) as {
      pending?: Pending[];
      urgent?: Pending[];
      disabled?: boolean;
      noGroup?: boolean;
    };
    if (data.disabled || data.noGroup) return;

    const urgent = data.urgent ?? [];
    for (const m of urgent) {
      if (!urgentRef.current.has(m.id)) {
        try {
          new Notification("¡Partido pronto!", {
            body: `${m.home} vs ${m.away} en menos de 2 h — falta tu pronóstico`,
            icon: "/icon.svg",
            tag: `we26-urgent-${m.id}`,
          });
          urgentRef.current.add(m.id);
        } catch {
          /* ignore */
        }
      }
    }

    const pending = data.pending?.filter((m) => !notifiedRef.current.has(m.id)) ?? [];
    if (!pending.length) return;

    const title =
      pending.length === 1 ? "Falta tu pronóstico" : `${pending.length} pronósticos pendientes`;

    const body =
      pending.length === 1
        ? `${pending[0].home} vs ${pending[0].away} — completa tu polla`
        : pending
            .slice(0, 3)
            .map((m) => `${m.home} vs ${m.away}`)
            .join(" · ");

    try {
      new Notification(title, { body, icon: "/icon.svg", tag: "we26-pending" });
      pending.forEach((m) => notifiedRef.current.add(m.id));
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, CHECK_MS);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [check]);

  return null;
}

export function EnableNotificationsButton() {
  async function enable() {
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("WE26", {
        body: "Te avisaremos 2 h antes si falta un pronóstico.",
        icon: "/icon.svg",
      });
    }
  }

  if (typeof window !== "undefined" && Notification?.permission === "granted") {
    return null;
  }

  return (
    <button type="button" onClick={enable} className="btn-ghost text-xs">
      Activar avisos
    </button>
  );
}
