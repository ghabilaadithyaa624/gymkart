import { Router } from "express";
import { z } from "zod";
import {
  clearSessionCookie,
  createSessionToken,
  emailExists,
  getUserById,
  getSessionUser,
  login,
  setSessionCookie,
  signUp,
} from "../lib/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

const SignupBody = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fitnessGoal: z.enum(["weight_loss", "muscle_gain", "general_fitness"]).optional().nullable(),
});
const LoginBody = z.object({ email: z.string().email(), password: z.string().min(1) });

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const user = await getSessionUser(req);
  res.json({ user });
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "invalid", issues: parsed.error.flatten().fieldErrors });
    return;
  }
  if (await emailExists(parsed.data.email)) {
    res.status(409).json({ error: "email_taken", message: "An account with this email already exists." });
    return;
  }
  const { id, role } = await signUp(parsed.data);
  const token = await createSessionToken({ sub: id, role });
  setSessionCookie(res, token);
  const user = await getUserById(id);
  res.json({ user });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "invalid" });
    return;
  }
  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) {
    res.status(401).json({ error: "bad_credentials", message: "Incorrect email or password." });
    return;
  }
  const token = await createSessionToken({ sub: user.id, role: user.role });
  setSessionCookie(res, token);
  res.json({ user });
});

// POST /api/auth/logout
router.post("/logout", async (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// POST /api/auth/goal
router.post("/goal", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "auth" }); return; }
  const parsed = z
    .object({ fitnessGoal: z.enum(["weight_loss", "muscle_gain", "general_fitness"]).nullable() })
    .safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "invalid" }); return; }
  await db.update(users).set({ fitnessGoal: parsed.data.fitnessGoal }).where(eq(users.id, user.id));
  res.json({ ok: true });
});

export default router;
