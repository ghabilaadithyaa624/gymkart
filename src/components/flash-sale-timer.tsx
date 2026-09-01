"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_STORAGE_KEY = "gymkart-flash-sale-ends-at";
const FALLBACK_DURATION_MS = 24 * 60 * 60 * 1000;

type FlashSaleTimerProps = {
  /** A server-provided ISO 8601 timestamp. When omitted, a shared browser deadline is persisted. */
  endsAt?: string;
  storageKey?: string;
  className?: string;
  compact?: boolean;
};

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function timerParts(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

/** Hydration-safe countdown: the server and first client render share the same placeholder. */
export function FlashSaleTimer({
  endsAt,
  storageKey = DEFAULT_STORAGE_KEY,
  className = "",
  compact = false,
}: FlashSaleTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const propDeadline = parseTimestamp(endsAt);
    const storedTimestamp = parseTimestamp(window.localStorage.getItem(storageKey));
    const savedDeadline = storedTimestamp && storedTimestamp > Date.now() ? storedTimestamp : null;
    const target = propDeadline ?? savedDeadline ?? Date.now() + FALLBACK_DURATION_MS;

    if (propDeadline === null && savedDeadline === null) {
      window.localStorage.setItem(storageKey, new Date(target).toISOString());
    }

    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    const firstTick = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(interval);
    };
  }, [endsAt, storageKey]);

  const parts = useMemo(() => timerParts(remaining ?? 0), [remaining]);
  const urgent = remaining !== null && remaining > 0 && remaining <= 10 * 60 * 1000;
  const expired = remaining === 0;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${urgent ? "animate-urgent-pulse text-red-200" : ""} ${className}`}
        role="timer"
        aria-live="off"
        aria-label={expired ? "Flash sale ended" : `Flash sale ends in ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds`}
      >
        <Clock3 size={13} aria-hidden="true" />
        {remaining === null ? "--:--:--" : expired ? "00:00:00" : `${parts.hours}:${parts.minutes}:${parts.seconds}`}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${urgent ? "animate-urgent-pulse" : ""} ${className}`}
      role="timer"
      aria-live="off"
      aria-label={expired ? "Flash sale ended" : `Flash sale ends in ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds`}
    >
      {(["hours", "minutes", "seconds"] as const).map((unit, index) => (
        <div key={unit} className="contents">
          {index > 0 && <span className="pb-4 font-display text-lg font-bold text-flame">:</span>}
          <span className="flex min-w-12 flex-col items-center rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur">
            <span className="font-display text-lg font-bold leading-none tabular-nums">{remaining === null ? "--" : parts[unit]}</span>
            <span className="mt-1 text-[8px] font-bold tracking-widest text-white/55 uppercase">{unit.slice(0, 3)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default FlashSaleTimer;
