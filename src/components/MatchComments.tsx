"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = { id: string; text: string; author: string; createdAt: string };

type Props = { matchId: number };

export function MatchComments({ matchId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/polla/comments?matchId=${matchId}`);
    if (res.ok) {
      const data = (await res.json()) as { comments: Comment[] };
      setComments(data.comments);
    }
  }, [matchId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/polla/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, text: text.trim() }),
      });
      if (res.ok) {
        setText("");
        await load();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-pitch-mid/30 pt-3">
      <p className="text-[10px] uppercase tracking-wider text-muted">Comentarios del grupo</p>
      <ul className="max-h-32 space-y-1.5 overflow-y-auto text-xs">
        {comments.length === 0 && (
          <li className="text-muted">Sé el primero en comentar este partido.</li>
        )}
        {comments.map((c) => (
          <li key={c.id}>
            <span className="font-medium text-lime">{c.author}</span>
            <span className="text-muted"> · </span>
            <span className="text-cream">{c.text}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          maxLength={280}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comenta con el grupo…"
          className="min-h-[36px] flex-1 rounded-lg border border-pitch-mid bg-pitch px-2 py-1 text-xs text-cream"
        />
        <button type="submit" disabled={loading} className="btn-ghost !min-h-9 !px-2 text-xs">
          Enviar
        </button>
      </form>
    </div>
  );
}
