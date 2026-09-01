"use client";

import { Check, LogOut, PackagePlus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GOALS } from "@/lib/money";
import { useGK } from "@/lib/store";

export function LogoutButton() {
  const logout = useGK((s) => s.logout);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await logout();
        router.push("/");
        router.refresh();
      }}
      className="btn-ghost !py-2.5 !text-xs !text-chili hover:!border-chili hover:!text-chili"
    >
      <LogOut size={14} /> {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function GoalEditor({ current }: { current: string | null }) {
  const [goal, setGoal] = useState(current);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useGK((s) => s.toast);
  const refreshCounts = useGK((s) => s.refreshCounts);

  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-bold">
        <Sparkles size={16} className="text-flame" /> Your fitness goal
      </h3>
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {GOALS.map((g) => {
          const active = goal === g.key;
          return (
            <button
              key={g.key}
              onClick={async () => {
                const next = active ? null : g.key;
                setGoal(next);
                setBusy(true); setSaved(false);
                try {
                  await fetch("/api/auth/goal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fitnessGoal: next }),
                  });
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                } catch {
                  toast({ title: "Couldn't save goal", tone: "warn" });
                } finally {
                  setBusy(false);
                  refreshCounts();
                }
              }}
              className={`rounded-xl border-2 px-2 py-2.5 text-[12px] font-bold transition-all ${
                active ? "border-flame bg-flame-tint text-flame-dark" : "border-line text-mute hover:border-flame/40"
              } ${busy ? "opacity-60" : ""}`}
            >
              {g.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-mute">
        {saved ? <><Check size={12} className="text-leaf-dark" /> Saved — your recommendations updated.</> : "Drives “For your goal” picks on the home page."}
      </p>
    </div>
  );
}

export function ReorderButton({ items }: { items: Array<{ productId: string; quantity: number }> }) {
  const [busy, setBusy] = useState(false);
  const addToCart = useGK((s) => s.addToCart);
  const toast = useGK((s) => s.toast);
  const router = useRouter();
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        for (const i of items) await addToCart(i.productId, i.quantity);
        setBusy(false);
        toast({ title: "Order re-added to cart", href: "/cart", hrefLabel: "Checkout", tone: "ok" });
        router.push("/cart");
      }}
      className="inline-flex items-center gap-1.5 rounded-lg bg-flame px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-flame-dark active:scale-95 disabled:opacity-60"
    >
      <PackagePlus size={14} /> {busy ? "Adding…" : "Reorder all"}
    </button>
  );
}
