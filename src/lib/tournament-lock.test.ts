import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMundialStartMs, isTournamentLocked } from "@/lib/tournament-lock";

describe("isTournamentLocked", () => {
  it("no bloquea antes del primer partido", () => {
    assert.equal(isTournamentLocked(getMundialStartMs() - 60_000), false);
  });

  it("bloquea desde el primer pitido", () => {
    assert.equal(isTournamentLocked(getMundialStartMs()), true);
  });
});
