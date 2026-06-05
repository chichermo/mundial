"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "we26-favorite-teams";

export function useFavoriteTeams() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/favorites");
        if (res.ok) {
          const data = (await res.json()) as { teams: string[] };
          if (data.teams?.length) {
            setFavorites(data.teams);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.teams));
            setReady(true);
            return;
          }
        }
      } catch {
        /* sin sesión */
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setFavorites(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        setFavorites([]);
      }
      setReady(true);
    }
    load();
  }, []);

  const toggle = useCallback((team: string) => {
    setFavorites((prev) => {
      const next = prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      fetch("/api/auth/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: next }),
      }).catch(() => {});
      return next;
    });
  }, []);

  const isFavorite = useCallback((team: string) => favorites.includes(team), [favorites]);

  return { favorites, toggle, isFavorite, ready };
}
