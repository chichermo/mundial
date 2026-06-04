import { cookies } from "next/headers";

export const USER_COOKIE = "mundial_user";
export const POLLA_COOKIE = "mundial_polla";

export type UserSession = {
  userId: string;
  email: string;
  displayName: string;
};

export type PollaSession = {
  memberId: string;
  memberName: string;
  groupId: string;
  groupName: string;
  groupCode: string;
};

/** @deprecated use getUserSession + getPollaSession */
export type SessionData = PollaSession & UserSession;

export async function getUserSession(): Promise<UserSession | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export async function getPollaSession(): Promise<PollaSession | null> {
  const jar = await cookies();
  const raw = jar.get(POLLA_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PollaSession;
  } catch {
    return null;
  }
}

/** Sesión completa: usuario logueado + grupo activo */
export async function getFullSession(): Promise<(UserSession & PollaSession) | null> {
  const user = await getUserSession();
  const polla = await getPollaSession();
  if (!user || !polla) return null;
  return { ...user, ...polla };
}

/** Compat: solo grupo activo (requiere usuario para nuevas rutas) */
export async function getSession(): Promise<PollaSession | null> {
  return getPollaSession();
}

export async function setUserSession(data: UserSession) {
  const jar = await cookies();
  jar.set(USER_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function setPollaSession(data: PollaSession) {
  const jar = await cookies();
  jar.set(POLLA_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearPollaSession() {
  const jar = await cookies();
  jar.delete(POLLA_COOKIE);
}

export async function clearAllSessions() {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
  jar.delete(POLLA_COOKIE);
}

/** @deprecated */
export async function setSession(data: PollaSession) {
  return setPollaSession(data);
}

/** @deprecated */
export async function clearSession() {
  return clearPollaSession();
}

export function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
