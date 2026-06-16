import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMatch } from "@/lib/matches-data";
import { getMatchCalendarDay } from "@/lib/match-order";
import { getKickoffUtc } from "@/lib/timezones";

/** Horarios oficiales (openfootball) para partidos nocturnos en costa oeste / México. */
const LATE_KICKOFFS: {
  id: number;
  utcIso: string;
  calendarDayChile: string;
}[] = [
  { id: 6, utcIso: "2026-06-14T04:00:00.000Z", calendarDayChile: "2026-06-14" }, // 13 Jun 21:00 PT
  { id: 20, utcIso: "2026-06-17T04:00:00.000Z", calendarDayChile: "2026-06-17" }, // 16 Jun 21:00 PT
  { id: 36, utcIso: "2026-06-21T04:00:00.000Z", calendarDayChile: "2026-06-21" }, // 20 Jun 22:00 CT
];

describe("kickoff accuracy (late US/MX games)", () => {
  for (const { id, utcIso, calendarDayChile } of LATE_KICKOFFS) {
    it(`match #${id} kickoff UTC and Chile calendar day`, () => {
      const m = getMatch(id)!;
      assert.equal(getKickoffUtc(m.date, m.kickoffEst).toISOString(), utcIso);
      assert.equal(getMatchCalendarDay(m), calendarDayChile);
    });
  }
});
