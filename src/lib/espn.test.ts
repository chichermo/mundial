import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveMatchIdByTeams } from "@/lib/fixture-map";
import { formatEspnDate, getScoreboardDates, isEspnMatchFinished } from "@/lib/espn";
import type { EspnEvent } from "@/lib/espn";

describe("espn helpers", () => {
  it("formats ESPN date param", () => {
    assert.equal(formatEspnDate("2026-06-11"), "20260611");
  });

  it("includes recent match days in scoreboard window", () => {
    const dates = getScoreboardDates("2026-06-12");
    assert.ok(dates.includes("20260611"));
    assert.ok(dates.includes("20260612"));
  });

  it("detects finished matches", () => {
    const event = {
      id: "1",
      date: "2026-06-11T19:00Z",
      name: "test",
      competitions: [
        {
          id: "1",
          date: "2026-06-11T19:00Z",
          status: { type: { completed: true, name: "STATUS_FULL_TIME", state: "post" } },
          competitors: [],
        },
      ],
    } satisfies EspnEvent;
    assert.equal(isEspnMatchFinished(event), true);
  });
});

describe("resolveMatchIdByTeams (ESPN)", () => {
  it("maps Mexico vs South Africa on opening day", () => {
    const id = resolveMatchIdByTeams(
      "2026-06-11T19:00Z",
      "Mexico",
      "South Africa",
    );
    assert.equal(id, 1);
  });

  it("maps South Korea vs Czechia", () => {
    const id = resolveMatchIdByTeams(
      "2026-06-12T02:00Z",
      "South Korea",
      "Czechia",
    );
    assert.equal(id, 2);
  });

  it("maps South Africa vs Canada to #75 (not #73)", () => {
    const id = resolveMatchIdByTeams(
      "2026-06-28T19:00:00.000Z",
      "South Africa",
      "Canada",
    );
    assert.equal(id, 75);
  });

  it("maps Germany vs Paraguay to #73", () => {
    const id = resolveMatchIdByTeams(
      "2026-06-29T20:30:00.000Z",
      "Germany",
      "Paraguay",
    );
    assert.equal(id, 73);
  });
});
