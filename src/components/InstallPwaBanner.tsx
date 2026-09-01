"use client";

import { Download, Dumbbell, X } from "lucide-react";
import { useEffect, useState } from "react";

/** Chromium's install prompt event is not currently part of lib.dom.d.ts. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const DISMISSED_AT_KEY = "gymkart-pwa-banner-dismissed-at";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

export default function InstallPwaBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation remains hidden if the browser cannot register the worker.
      });
    }

    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY) ?? 0);
    const recentlyDismissed = Date.now() - dismissedAt < DISMISS_FOR_MS;
    if (isInstalled || recentlyDismissed) return;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
      window.localStorage.removeItem(DISMISSED_AT_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setVisible(false);
    setInstallPrompt(null);
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "dismissed") {
      window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    }
    setVisible(false);
    setInstallPrompt(null);
  }

  if (!visible || !installPrompt) return null;

  return (
    <aside
      className="fixed inset-x-3 bottom-17 z-[75] animate-fade-up rounded-2xl border border-white/10 bg-ink p-3.5 text-white shadow-[0_20px_60px_rgba(0,0,0,.38)] sm:right-5 sm:bottom-5 sm:left-auto sm:w-[440px] sm:p-4"
      aria-label="Install GymKart application"
      role="region"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install banner"
        className="absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-flame"
      >
        <X size={15} />
      </button>

      <div className="flex items-center gap-3 pr-8">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-flame text-white shadow-[0_7px_20px_rgba(255,107,53,.28)]">
          <Dumbbell size={21} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-bold">Train smarter with GymKart</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">Fast access to authentic supplements, equipment and your cart.</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-xl px-4 py-2.5 text-xs font-bold text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
        >
          Dismiss
        </button>
        <button type="button" onClick={install} className="btn-primary !py-2.5 !text-xs">
          <Download size={15} aria-hidden="true" /> Install GymKart App
        </button>
      </div>
    </aside>
  );
}
