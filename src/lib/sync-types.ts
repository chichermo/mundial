export type SyncResult = {
  ok: boolean;
  source: string;
  updated: number;
  skipped: number;
  unmapped: number;
  noScores: number;
  totalFetched: number;
  details: string[];
  error?: string;
};
