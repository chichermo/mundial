import { NextResponse } from "next/server";
import { matches } from "@/lib/matches-data";
import { prisma } from "@/lib/prisma";
import { requirePollaMember, requireUser } from "@/lib/require-auth";
import { getKickoffUtc } from "@/lib/timezones";

const HOURS_AHEAD = 48;

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ pending: [] });

  if (!user.notifyMatchReminders) {
    return NextResponse.json({ pending: [], disabled: true });
  }

  const auth = await requirePollaMember();
  if (!auth) return NextResponse.json({ pending: [], noGroup: true });

  const member = await prisma.member.findFirst({
    where: { id: auth.polla.memberId },
    include: {
      matchPredictions: { select: { matchId: true } },
      knockoutPredictions: { select: { matchId: true } },
    },
  });

  if (!member) return NextResponse.json({ pending: [] });

  const predicted = new Set([
    ...member.matchPredictions.map((p) => p.matchId),
    ...member.knockoutPredictions.map((p) => p.matchId),
  ]);

  const now = Date.now();
  const horizon = now + HOURS_AHEAD * 60 * 60 * 1000;

  const pending = matches
    .filter((m) => {
      const kick = getKickoffUtc(m.date, m.kickoffEst).getTime();
      return kick > now && kick <= horizon && !predicted.has(m.id);
    })
    .map((m) => ({
      id: m.id,
      home: m.home,
      away: m.away,
      phase: m.phase,
      kickoff: getKickoffUtc(m.date, m.kickoffEst).toISOString(),
    }))
    .slice(0, 12);

  return NextResponse.json({ pending, hoursAhead: HOURS_AHEAD });
}
