import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getQualificationCutoffGroupPts,
  isInQualificationZone,
} from "@/lib/groups";

describe("qualification zone ties", () => {
  it("uses 4th place score as cutoff", () => {
    const scores = [20, 18, 15, 15, 12, 10, 8, 5];
    assert.equal(getQualificationCutoffGroupPts(scores, 4), 15);
    assert.equal(isInQualificationZone(15, 15), true);
    assert.equal(isInQualificationZone(12, 15), false);
  });

  it("includes all players tied at cutoff", () => {
    const scores = [20, 18, 15, 15, 15, 10, 8, 5];
    const cutoff = getQualificationCutoffGroupPts(scores, 4);
    const inZone = scores.filter((pts) => isInQualificationZone(pts, cutoff));
    assert.deepEqual(inZone, [20, 18, 15, 15, 15]);
  });

  it("handles fewer members than qualifier slots", () => {
    const scores = [10, 5];
    const cutoff = getQualificationCutoffGroupPts(scores, 4);
    assert.equal(cutoff, 5);
    assert.equal(isInQualificationZone(10, cutoff), true);
    assert.equal(isInQualificationZone(5, cutoff), true);
  });
});
