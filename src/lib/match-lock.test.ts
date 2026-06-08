import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasOfficialResult, isPredictionLocked } from "@/lib/match-lock";

describe("isPredictionLocked", () => {
  const future = {
    date: "2099-06-15",
    kickoffEst: "20:00",
  };

  it("bloquea si hay resultado oficial", () => {
    assert.equal(
      isPredictionLocked(future, { homeScore: 2, awayScore: 1 }),
      true,
    );
  });

  it("no bloquea partido futuro sin resultado", () => {
    assert.equal(isPredictionLocked(future, null), false);
  });

  it("hasOfficialResult requiere ambos marcadores", () => {
    assert.equal(hasOfficialResult({ homeScore: 1, awayScore: null }), false);
    assert.equal(hasOfficialResult({ homeScore: 1, awayScore: 0 }), true);
  });
});
