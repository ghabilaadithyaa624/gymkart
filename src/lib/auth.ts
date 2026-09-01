import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const COOKIE = "gk_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "gymkart-dev-secret-change-me");

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  fitnessGoal: string | null;
};

async function setSessionCookie(payload: { sub: string; role: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        fitnessGoal: users.fitnessGoal,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
});

export async function signUp(input: { name: string; email: string; password: string; fitnessGoal?: string | null }) {
  const hash = bcrypt.hashSync(input.password, 10);
  const rows = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: hash,
      fitnessGoal: input.fitnessGoal ?? null,
    })
    .returning({ id: users.id, role: users.role });
  await setSessionCookie({ sub: rows[0].id, role: rows[0].role });
  return getSessionUser();
}

export async function login(email: string, password: string) {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return null;
  await setSessionCookie({ sub: user.id, role: user.role });
  return getSessionUser();
}

export async function emailExists(email: string) {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return rows.length > 0;
}
