"use client";

import { ArrowRight, Dumbbell, Flame, HeartPulse, Loader2, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { GOALS } from "@/lib/money";
import { useGK } from "@/lib/store";

const GOAL_META: Record<string, { icon: typeof Flame; desc: string }> = {
  weight_loss: { icon: Flame, desc: "Burn fat, build endurance" },
  muscle_gain: { icon: Dumbbell, desc: "Size, strength, protein-first" },
  general_fitness: { icon: HeartPulse, desc: "Move more, feel better" },
};

function nextTarget(fallback: string) {
  return fallback.startsWith("/") ? fallback : "/";
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const afterAuth = useGK((s) => s.afterAuth);
  const toast = useGK((s) => s.toast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = nextTarget(sp.get("next") ?? "/account");

  return (
    <form
      className="card w-full max-w-md p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError("");
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const body = await res.json();
          if (!res.ok) { setError(body.message ?? "Login failed."); return; }
          await afterAuth(body.user);
          toast({ title: `Welcome back, ${body.user.name.split(" ")[0]}!`, tone: "ok" });
          router.push(next);
          router.refresh();
        } catch { setError("Network error. Try again."); }
        finally { setBusy(false); }
      }}
    >
      <h1 className="font-display text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-mute">Sign in to sync your cart, wishlist and orders.</p>

      <label className="mt-6 block text-sm font-semibold">
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input mt-1.5" />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input mt-1.5" />
      </label>
      {error && <p className="mt-3 rounded-lg bg-chili/10 px-3.5 py-2.5 text-sm font-semibold text-chili">{error}</p>}
      <button disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Sign in
      </button>

      <div className="mt-4 rounded-xl border border-line bg-sand px-4 py-3 text-xs text-mute">
        <span className="font-bold text-ink">Demo account:</span> demo@gymkart.in / demo1234
      </div>
      <p className="mt-5 text-center text-sm text-mute">
        New to GymKart? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-flame">Create an account</Link>
      </p>
    </form>
  );
}

function SignupInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const afterAuth = useGK((s) => s.afterAuth);
  const toast = useGK((s) => s.toast);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = nextTarget(sp.get("next") ?? "/account");

  return (
    <form
      className="card w-full max-w-md p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError("");
        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, fitnessGoal: goal }),
          });
          const body = await res.json();
          if (!res.ok) {
            setError(body.message ?? (body.issues ? Object.values(body.issues as Record<string, string[]>).flat()[0] : "Signup failed."));
            return;
          }
          await afterAuth(body.user);
          toast({ title: `Welcome to GymKart, ${body.user.name.split(" ")[0]}!`, tone: "ok" });
          router.push(next);
          router.refresh();
        } catch { setError("Network error. Try again."); }
        finally { setBusy(false); }
      }}
    >
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-mute">One account for cart, orders and goal-based picks.</p>

      <div className="mt-6 grid gap-4">
        <label className="block text-sm font-semibold">
          Full name
          <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rohan Kapoor" className="input mt-1.5" />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input mt-1.5" />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" className="input mt-1.5" />
        </label>
      </div>

      {/* Fitness goal picker */}
      <fieldset className="mt-6">
        <legend className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles size={14} className="text-flame" /> What's your main goal? <span className="font-normal text-mute">(optional)</span>
        </legend>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          {GOALS.map((g) => {
            const meta = GOAL_META[g.key];
            const Icon = meta.icon;
            const active = goal === g.key;
            return (
              <button
                type="button"
                key={g.key}
                onClick={() => setGoal(active ? null : g.key)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  active ? "border-flame bg-flame-tint shadow-[0_8px_20px_rgba(255,107,53,0.15)]" : "border-line bg-white hover:border-flame/40"
                }`}
              >
                <Icon size={17} className={active ? "text-flame" : "text-mute"} />
                <div className={`mt-1.5 text-[12px] leading-tight font-bold ${active ? "text-flame-dark" : ""}`}>{g.label}</div>
                <div className="mt-0.5 hidden text-[10px] leading-tight text-mute sm:block">{meta.desc}</div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-mute">
          <TrendingUp size={12} /> Powers your “Recommended for you” section.
        </p>
      </fieldset>

      {error && <p className="mt-4 rounded-lg bg-chili/10 px-3.5 py-2.5 text-sm font-semibold text-chili">{error}</p>}
      <button disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Create account
      </button>
      <p className="mt-5 text-center text-sm text-mute">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-flame">Sign in</Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="card h-96 w-full max-w-md animate-pulse" />}>
      <LoginInner />
    </Suspense>
  );
}
export function SignupForm() {
  return (
    <Suspense fallback={<div className="card h-[32rem] w-full max-w-md animate-pulse" />}>
      <SignupInner />
    </Suspense>
  );
}
