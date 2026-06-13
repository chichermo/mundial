import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matches } from "@/lib/matches-data";
import {
  compareMatchesByKickoff,
  findCurrentMatch,
  groupMatchesByDateSorted,
  splitMatchesByOfficialResult,
} from "@/lib/match-order";

describe("match-order", () => {
  it("orders opening matches chronologically", () => {
    const m1 = matches.find((m) => m.id === 1)!;
    const m2 = matches.find((m) => m.id === 2)!;
    assert.ok(compareMatchesByKickoff(m1, m2) < 0);
  });

  it("groups matches by date in kickoff order", () => {
    const groups = groupMatchesByDateSorted(matches.filter((m) => m.phase === "group"));
    assert.ok(groups.length > 0);
    assert.equal(groups[0].date, "2026-06-11");
    assert.equal(groups[0].matches[0]?.id, 1);
    assert.equal(groups[0].matches[1]?.id, 2);
  });

  it("splits finished matches into history", () => {
    const sample = matches.filter((m) => m.phase === "group").slice(0, 4);
    const results = {
      1: { homeScore: 2, awayScore: 0 },
      2: { homeScore: 2, awayScore: 1 },
    };
    const { active, history } = splitMatchesByOfficialResult(sample, results);
    assert.equal(history.length, 2);
    assert.equal(active.length, 2);
    assert.equal(history[0]?.id, 2);
    assert.equal(active[0]?.id, 3);
  });

  it("finds current match as first without official result", () => {
    const sample = matches.filter((m) => m.phase === "group").slice(0, 3);
    const current = findCurrentMatch(sample, {
      1: { homeScore: 2, awayScore: 0 },
      2: { homeScore: 2, awayScore: 1 },
    });
    assert.equal(current?.id, 3);
  });
});
