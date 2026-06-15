import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMatch, matches } from "@/lib/matches-data";
import { getMatchStatus } from "@/lib/match-status";
import { getKickoffUtc } from "@/lib/timezones";

describe("getMatchStatus", () => {
  it("Australia vs Turkiye kickoff aligns with FIFA (14 Jun 04:00 UTC)", () => {
    const m = getMatch(6)!;
    const kick = getKickoffUtc(m.date, m.kickoffEst);
    assert.equal(kick.toISOString(), "2026-06-14T04:00:00.000Z");

    const originalNow = Date.now;
    Date.now = () => kick.getTime() - 60 * 60 * 1000;
    assert.equal(getMatchStatus(m, null), "pending");
    Date.now = originalNow;
  });

  it("marks live only within two hours of kickoff", () => {
    const m = matches[0];
    const kick = getKickoffUtc(m.date, m.kickoffEst).getTime();
    const originalNow = Date.now;
    Date.now = () => kick + 30 * 60 * 1000;
    assert.equal(getMatchStatus(m, null), "live");
    Date.now = () => kick + 3 * 60 * 60 * 1000;
    assert.equal(getMatchStatus(m, null), "awaiting_result");
    Date.now = originalNow;
  });
});
