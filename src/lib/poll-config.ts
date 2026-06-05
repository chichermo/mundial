/** Reglas de la polla Balsuos (8 jugadores, top 4 a eliminatoria). */
export const POLL_CONFIG = {
  maxMembers: Number(process.env.POLL_MAX_MEMBERS ?? 8),
  qualifiersCount: Number(process.env.POLL_QUALIFIERS ?? 4),
} as const;
