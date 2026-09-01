import { z } from "zod";
import { clearSession, emailExists, getSessionUser, login, signUp } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SignupBody = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fitnessGoal: z.enum(["weight_loss", "muscle_gain", "general_fitness"]).optional().nullable(),
});
const LoginBody = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function GET(_req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action !== "me") return Response.json({ error: "not_found" }, { status: 404 });
  const user = await getSessionUser();
  return Response.json({ user });
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (action === "signup") {
    const parsed = SignupBody.safeParse(body);
    if (!parsed.success) return Response.json({ error: "invalid", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
    if (await emailExists(parsed.data.email)) {
      return Response.json({ error: "email_taken", message: "An account with this email already exists." }, { status: 409 });
    }
    const user = await signUp(parsed.data);
    return Response.json({ user });
  }

  if (action === "login") {
    const parsed = LoginBody.safeParse(body);
    if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
    const user = await login(parsed.data.email, parsed.data.password);
    if (!user) return Response.json({ error: "bad_credentials", message: "Incorrect email or password." }, { status: 401 });
    return Response.json({ user });
  }

  if (action === "logout") {
    await clearSession();
    return Response.json({ ok: true });
  }

  if (action === "goal") {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "auth" }, { status: 401 });
    const parsed = z.object({ fitnessGoal: z.enum(["weight_loss", "muscle_gain", "general_fitness"]).nullable() }).safeParse(body);
    if (!parsed.success) return Response.json({ error: "invalid" }, { status: 422 });
    const { db } = await import("@/db");
    const { users } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ fitnessGoal: parsed.data.fitnessGoal }).where(eq(users.id, user.id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "not_found" }, { status: 404 });
}
