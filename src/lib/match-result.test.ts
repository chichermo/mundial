import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPrematureResult, toEffectiveResult } from "@/lib/match-result";

describe("match-result", () => {
  const match73 = { date: "2026-06-29", kickoffEst: "16:30" };

  it("ignora resultado guardado antes del pitido (#73)", () => {
    const kick = new Date("2026-06-29T20:30:00.000Z").getTime();
    Date.now = () => kick - 60 * 60 * 1000;
    try {
      const row = { matchId: 73, homeScore: 0, awayScore: 1, winnerLabel: "Paraguay" };
      assert.equal(isPrematureResult(match73, row), true);
      assert.deepEqual(toEffectiveResult(row), {
        homeScore: null,
        awayScore: null,
        winnerLabel: null,
      });
    } finally {
      Date.now = () => new Date().getTime();
    }
  });

  it("acepta resultado tras el pitido", () => {
    const kick = new Date("2026-06-29T20:30:00.000Z").getTime();
    Date.now = () => kick + 60 * 1000;
    try {
      const row = { matchId: 73, homeScore: 2, awayScore: 1, winnerLabel: null };
      assert.equal(isPrematureResult(match73, row), false);
      assert.deepEqual(toEffectiveResult(row), {
        homeScore: 2,
        awayScore: 1,
        winnerLabel: null,
      });
    } finally {
      Date.now = () => new Date().getTime();
    }
  });
});
