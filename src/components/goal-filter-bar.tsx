"use client";

import { Dumbbell, Flame, House, PiggyBank, Target } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const FITNESS_GOALS = [
  { label: "Bulking", value: "bulking", icon: Dumbbell },
  { label: "Lean Muscle", value: "lean_muscle", icon: Target },
  { label: "Fat Loss", value: "fat_loss", icon: Flame },
  { label: "Home Workout", value: "home_workout", icon: House },
  { label: "Budget Essentials", value: "budget_essentials", icon: PiggyBank },
] as const;

export default function GoalFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeGoal = searchParams.get("goal");

  function selectGoal(goal: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (activeGoal === goal) params.delete("goal");
    else params.set("goal", goal);

    // A changed filter always returns to the first result page.
    params.delete("page");
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <section className="mb-6 rounded-2xl border border-line bg-ink px-4 py-4 text-white sm:px-5" aria-labelledby="goal-filter-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="shrink-0 sm:pr-3">
          <h2 id="goal-filter-heading" className="font-display text-sm font-bold">Shop by goal</h2>
          <p className="text-[11px] text-white/55">Find your fit, faster</p>
        </div>

        <div className="scroll-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0" aria-label="Fitness goal filters">
          {FITNESS_GOALS.map(({ label, value, icon: Icon }) => {
            const active = value === activeGoal;
            return (
              <button
                key={value}
                type="button"
                onClick={() => selectGoal(value)}
                aria-pressed={active}
                disabled={isPending}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame disabled:cursor-wait disabled:opacity-70 ${active ? "border-flame bg-flame text-white shadow-[0_0_16px_rgba(255,107,53,.25)]" : "border-white/15 bg-white/8 text-white/85 hover:border-flame/60 hover:bg-white/15"}`}
              >
                <Icon size={14} aria-hidden="true" /> {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
