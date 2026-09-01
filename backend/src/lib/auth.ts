import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const COOKIE = "gk_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "gymkart-dev-secret-change-me");

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  fitnessGoal: string | null;
};

export async function createSessionToken(payload: { sub: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, { path: "/" });
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = req.cookies?.[COOKIE];
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
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  fitnessGoal?: string | null;
}): Promise<{ id: string; role: string }> {
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
  return rows[0];
}

export async function login(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    fitnessGoal: user.fitnessGoal,
  };
}

export async function emailExists(email: string): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}

export async function getUserById(id: string): Promise<SessionUser | null> {
  const rows = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, fitnessGoal: users.fitnessGoal })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] ?? null;
}
