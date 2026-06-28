import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HALFTIME_BETTING_GRACE_MATCH_ID,
  hasOfficialResult,
  isHalftimeBettingGraceActive,
  isPredictionLocked,
} from "@/lib/match-lock";

describe("isPredictionLocked", () => {
  const future = {
    date: "2099-06-15",
    kickoffEst: "20:00",
  };

  const match75 = {
    date: "2026-06-28",
    kickoffEst: "15:00",
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

  it("partido #75: no bloquea durante el 1er tiempo tras el pitido", () => {
    const kick = new Date("2026-06-28T19:00:00.000Z").getTime();
    const duringFirstHalf = kick + 20 * 60 * 1000;
    Date.now = () => duringFirstHalf;
    try {
      assert.equal(
        isPredictionLocked(match75, null, HALFTIME_BETTING_GRACE_MATCH_ID),
        false,
      );
      assert.equal(
        isHalftimeBettingGraceActive(HALFTIME_BETTING_GRACE_MATCH_ID, match75, null),
        true,
      );
    } finally {
      Date.now = () => new Date().getTime();
    }
  });

  it("partido #75: bloquea tras el entretiempo", () => {
    const kick = new Date("2026-06-28T19:00:00.000Z").getTime();
    const afterHalftime = kick + 50 * 60 * 1000;
    Date.now = () => afterHalftime;
    try {
      assert.equal(
        isPredictionLocked(match75, null, HALFTIME_BETTING_GRACE_MATCH_ID),
        true,
      );
    } finally {
      Date.now = () => new Date().getTime();
    }
  });

  it("otros partidos bloquean al pitido", () => {
    const kick = new Date("2026-06-28T19:00:00.000Z").getTime();
    Date.now = () => kick + 60 * 1000;
    try {
      assert.equal(isPredictionLocked(match75, null, 74), true);
    } finally {
      Date.now = () => new Date().getTime();
    }
  });
});
