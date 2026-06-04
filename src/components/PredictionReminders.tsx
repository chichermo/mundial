"use client";

import { useCallback, useEffect, useRef } from "react";

const CHECK_MS = 30 * 60 * 1000;
const STORAGE_KEY = "we26_last_notify";

type Pending = { id: number; home: string; away: string };

export function PredictionReminders() {
  const notifiedRef = useRef<Set<number>>(new Set());

  const check = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const res = await fetch("/api/polla/reminders");
    if (!res.ok) return;
    const data = (await res.json()) as {
      pending?: Pending[];
      disabled?: boolean;
      noGroup?: boolean;
    };
    if (data.disabled || data.noGroup || !data.pending?.length) return;

    const toNotify = data.pending.filter((m) => !notifiedRef.current.has(m.id));
    if (!toNotify.length) return;

    const title =
      toNotify.length === 1
        ? "Falta tu pronóstico"
        : `${toNotify.length} pronósticos pendientes`;

    const body =
      toNotify.length === 1
        ? `${toNotify[0].home} vs ${toNotify[0].away} — completa tu polla`
        : toNotify
            .slice(0, 3)
            .map((m) => `${m.home} vs ${m.away}`)
            .join(" · ");

    try {
      new Notification(title, {
        body,
        icon: "/icon.svg",
        tag: "we26-pending",
      });
      const last = sessionStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (!last || now - Number(last) > CHECK_MS) {
        toNotify.forEach((m) => notifiedRef.current.add(m.id));
        sessionStorage.setItem(STORAGE_KEY, String(now));
      }
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
        body: "Te avisaremos si faltan pronósticos antes de los partidos.",
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
