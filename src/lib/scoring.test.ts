import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getMatchOutcome, getMatchPoints, getKnockoutPoints, getTournamentPoints, SCORING_RULES } from "./scoring";

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

describe("getKnockoutPoints", () => {
  it("otorga 5 pts por marcador exacto en eliminatoria", () => {
    const pts = getKnockoutPoints(
      { homeScore: 2, awayScore: 1, winnerLabel: "Brazil" },
      { homeScore: 2, awayScore: 1, winnerLabel: "Brazil" },
    );
    assert.equal(pts, 5);
  });

  it("fallback +2 pts si solo hay pick de ganador legacy", () => {
    const pts = getKnockoutPoints(
      { homeScore: null, awayScore: null, winnerLabel: "Brazil" },
      { homeScore: 2, awayScore: 1, winnerLabel: "Brazil" },
    );
    assert.equal(pts, SCORING_RULES.knockoutWinner);
  });
});

describe("getTournamentPoints", () => {
  it("suma puntos por cada especial acertado", () => {
    const pts = getTournamentPoints(
      {
        champion: "Spain",
        surprise: "USA",
        revelationTeam: "Japan",
        topScorer: "Mbappe",
        revelationPlayer: "Yamal",
      } as Parameters<typeof getTournamentPoints>[0],
      {
        champion: "Spain",
        surprise: "USA",
        revelationTeam: "Japan",
        topScorer: "Mbappe",
        revelationPlayer: "Yamal",
      },
    );
    assert.equal(
      pts,
      SCORING_RULES.champion +
        SCORING_RULES.surprise +
        SCORING_RULES.revelationTeam +
        SCORING_RULES.topScorer +
        SCORING_RULES.revelationPlayer,
    );
  });

  it("no suma si no hay respuesta oficial", () => {
    const pts = getTournamentPoints(
      { champion: "Spain" } as Parameters<typeof getTournamentPoints>[0],
      {},
    );
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
