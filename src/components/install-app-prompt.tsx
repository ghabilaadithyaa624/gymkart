"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "gymkart-install-dismissed";

export default function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY) ?? 0);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;

    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      window.setTimeout(() => setVisible(true), 1800);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", beforeInstall);
  }, []);

  if (!visible || !promptEvent) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <aside className="fixed inset-x-3 bottom-17 z-[75] animate-fade-up rounded-2xl border border-white/10 bg-ink p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,.35)] sm:right-5 sm:bottom-5 sm:left-auto sm:w-[390px]" aria-label="Install GymKart app">
      <button onClick={dismiss} aria-label="Dismiss install app prompt" className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 hover:text-white"><X size={15} /></button>
      <div className="flex gap-3.5 pr-7">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-flame text-white"><Smartphone size={21} /></span>
        <div><h2 className="font-display text-sm font-bold">GymKart, one tap away</h2><p className="mt-1 text-xs leading-relaxed text-white/60">Install the app for faster shopping and easy access to your fitness stack.</p></div>
      </div>
      <div className="mt-3.5 flex gap-2">
        <button onClick={dismiss} className="flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white/65 hover:bg-white/10">Not now</button>
        <button
          onClick={async () => {
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            if (choice.outcome === "dismissed") window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
            setVisible(false);
            setPromptEvent(null);
          }}
          className="btn-primary flex-1 !py-2.5 !text-xs"
        ><Download size={15} /> Install app</button>
      </div>
    </aside>
  );
}
