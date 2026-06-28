import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTournamentPhase } from "@/lib/tournament-phase";
import { knockoutLabelsMatch } from "@/lib/knockout-labels";
import { buildKnockoutBracket } from "@/lib/knockout-bracket";

describe("tournament phase", () => {
  it("returns round32 on 28 June 2026", () => {
    assert.equal(getTournamentPhase(new Date("2026-06-28T12:00:00Z")), "round32");
  });

  it("returns group on 20 June 2026", () => {
    assert.equal(getTournamentPhase(new Date("2026-06-20T12:00:00Z")), "group");
  });
});

describe("knockout labels", () => {
  it("maps legacy placeholder to team name", () => {
    assert.equal(knockoutLabelsMatch("Group A Runners Up", "South Africa"), true);
  });
});

describe("knockout bracket", () => {
  it("includes round32 with real teams for match 73", () => {
    const bracket = buildKnockoutBracket();
    const r32 = bracket.find((r) => r.phase === "round32")!;
    const m73 = r32.slots.find((s) => s.match.id === 73)!.match;
    assert.equal(m73.home, "South Africa");
    assert.equal(m73.away, "Canada");
  });

  it("links round16 match 90 to winners of 73 and 75", () => {
    const bracket = buildKnockoutBracket();
    const r16 = bracket.find((r) => r.phase === "round16")!;
    const m90 = r16.slots.find((s) => s.match.id === 90)!;
    assert.deepEqual(m90.feedsFrom, [73, 75]);
  });
});
