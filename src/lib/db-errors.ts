/** Error de SQLite/Turso por columna o tabla inexistente. */
export function isMissingColumnError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("no such column") ||
    msg.includes("does not exist") ||
    msg.includes("Unknown column")
  );
}
