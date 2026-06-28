export const MAX_GOALS = 15;

export function formatScoreInput(score: number | undefined | null): string {
  return score == null ? "" : String(score);
}

export function sanitizeScoreInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  if (digits === "") return "";
  return String(Math.min(MAX_GOALS, Number.parseInt(digits, 10)));
}

export function parseScoreInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > MAX_GOALS) return null;
  return n;
}
