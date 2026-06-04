import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "mundial_admin";

function tokenForPassword(password: string): string {
  return createHash("sha256").update(`we26:${password}`).digest("hex");
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(tokenForPassword(password));
  const b = Buffer.from(tokenForPassword(expected));
  return timingSafeEqual(a, b);
}

export async function setAdminSession(password: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, tokenForPassword(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function isAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const valid = tokenForPassword(expected);
  const a = Buffer.from(token);
  const b = Buffer.from(valid);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
