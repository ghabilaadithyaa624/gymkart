import { Dumbbell, Gauge, HeartPulse, House } from "lucide-react";
import Link from "next/link";

const GOAL_FILTERS = [
  { label: "Muscle Building", goal: "muscle_gain", icon: Dumbbell },
  { label: "Fat Loss", goal: "weight_loss", icon: HeartPulse },
  { label: "Home Gym under ₹5,000", goal: "home_gym", icon: House },
  { label: "Endurance", goal: "endurance", icon: Gauge },
] as const;

export default function GoalFilters({ activeGoal }: { activeGoal?: string }) {
  return (
    <section className="mb-6 rounded-2xl border border-line bg-ink px-4 py-4 text-white sm:px-5" aria-labelledby="shop-by-goal">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="shrink-0 sm:pr-3">
          <h2 id="shop-by-goal" className="font-display text-sm font-bold">Shop by your goal</h2>
          <p className="text-[11px] text-white/55">Smart picks, less scrolling</p>
        </div>
        <div className="scroll-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0">
          {GOAL_FILTERS.map(({ label, goal, icon: Icon }) => {
            const active = goal === activeGoal;
            return (
              <Link
                key={goal}
                href={active ? "/products" : `/products?goal=${goal}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame ${active ? "border-flame bg-flame text-white" : "border-white/15 bg-white/8 text-white/85 hover:border-flame/60 hover:bg-white/15"}`}
              >
                <Icon size={14} aria-hidden="true" /> {label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
