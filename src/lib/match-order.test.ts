import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matches } from "@/lib/matches-data";
import { compareMatchesByKickoff, groupMatchesByDateSorted } from "@/lib/match-order";

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
});
