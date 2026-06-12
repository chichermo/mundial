import { NextRequest, NextResponse } from "next/server";
import { getBalsuosMembership } from "@/lib/balsuos-group";
import { switchToMember } from "@/lib/polla-groups";
import { getPollaSession, getUserSession } from "@/lib/session";

/** Restaura la cookie de polla si el usuario ya pertenece al grupo (solo en Route Handler). */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  const user = await getUserSession();
  if (!user) {
    return NextResponse.redirect(`${origin}/cuenta/login?next=/polla/grupos`);
  }

  const polla = await getPollaSession();
  if (polla) {
    return NextResponse.redirect(`${origin}/polla`);
  }

  const membership = await getBalsuosMembership(user.userId);
  if (!membership) {
    return NextResponse.redirect(`${origin}/polla/grupos`);
  }

  await switchToMember(user.userId, membership.memberId);
  return NextResponse.redirect(`${origin}/polla`);
}
