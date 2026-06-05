import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getMatchOutcome, getMatchPoints, SCORING_RULES } from "./scoring";

describe("getMatchPoints", () => {
  it("otorga 5 pts por marcador exacto", () => {
    const pts = getMatchPoints({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 });
    assert.equal(pts, SCORING_RULES.exactScore);
    assert.equal(pts, 5);
  });

  it("otorga 2 pts por resultado L/E/V", () => {
    const pts = getMatchPoints({ homeScore: 2, awayScore: 0 }, { homeScore: 3, awayScore: 1 });
    assert.equal(pts, 2);
  });

  it("otorga 0 pts si falla", () => {
    const pts = getMatchPoints({ homeScore: 2, awayScore: 1 }, { homeScore: 1, awayScore: 2 });
    assert.equal(pts, 0);
  });
});

describe("getMatchOutcome", () => {
  it("detecta local, empate y visitante", () => {
    assert.equal(getMatchOutcome(2, 0), "L");
    assert.equal(getMatchOutcome(1, 1), "E");
    assert.equal(getMatchOutcome(0, 1), "V");
  });
});
