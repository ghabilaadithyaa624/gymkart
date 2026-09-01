"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type FlashSaleTimerProps = {
  targetDate: string | Date;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
};

function timerParts(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

/**
 * Hydration-safe countdown. The server and initial browser render display a
 * placeholder; the real clock starts only after the component mounts.
 */
export function FlashSaleTimer({
  targetDate,
  onExpire,
  className = "",
  compact = false,
}: FlashSaleTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const expiredForTarget = useRef<number | null>(null);
  const targetTimestamp = targetDate instanceof Date ? targetDate.getTime() : Date.parse(targetDate);

  useEffect(() => {
    const tick = () => {
      const nextRemaining = Number.isFinite(targetTimestamp)
        ? Math.max(0, targetTimestamp - Date.now())
        : 0;

      setRemaining(nextRemaining);
      if (nextRemaining === 0 && expiredForTarget.current !== targetTimestamp) {
        expiredForTarget.current = targetTimestamp;
        onExpire?.();
      }
    };

    // Deferring the first update keeps the effect focused on its timer
    // subscription and guarantees the hydration placeholder is unchanged.
    const firstTick = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(interval);
    };
  }, [targetTimestamp, onExpire]);

  const parts = useMemo(() => timerParts(remaining ?? 0), [remaining]);
  const warning = remaining !== null && remaining > 0 && remaining < 15 * 60 * 1000;
  const expired = remaining === 0;
  const accessibleLabel = remaining === null
    ? "Flash sale countdown loading"
    : expired
      ? "Flash sale ended"
      : `Flash sale ends in ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds`;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold tabular-nums transition-shadow ${warning ? "animate-urgent-pulse text-amber-200 drop-shadow-[0_0_7px_rgba(245,158,11,0.5)]" : ""} ${className}`}
        role="timer"
        aria-live="off"
        aria-label={accessibleLabel}
      >
        <Clock3 size={13} aria-hidden="true" />
        {remaining === null ? "--:--:--" : `${parts.hours}:${parts.minutes}:${parts.seconds}`}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl transition-shadow ${warning ? "animate-urgent-pulse shadow-[0_0_20px_rgba(245,158,11,0.24)]" : ""} ${className}`}
      role="timer"
      aria-live="off"
      aria-label={accessibleLabel}
    >
      {(["hours", "minutes", "seconds"] as const).map((unit, index) => (
        <div key={unit} className="contents">
          {index > 0 && <span className={`pb-4 font-display text-lg font-bold ${warning ? "text-amber-400" : "text-flame"}`}>:</span>}
          <span className={`flex min-w-12 flex-col items-center rounded-lg border bg-white/10 px-2 py-1.5 backdrop-blur ${warning ? "border-amber-400/50" : "border-white/15"}`}>
            <span className="font-display text-lg leading-none font-bold tabular-nums">{remaining === null ? "--" : parts[unit]}</span>
            <span className="mt-1 text-[8px] font-bold tracking-widest text-white/55 uppercase">{unit.slice(0, 3)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default FlashSaleTimer;
