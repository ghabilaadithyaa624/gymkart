"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CheckCircle2, CreditCard, Loader2, MapPin, RefreshCcw, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Address } from "@/db/schema";
import { useGK } from "@/lib/store";

type GatewayState = "idle" | "processing" | "failed";

const IN_STATES = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Telangana", "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh", "Kerala", "Punjab", "Madhya Pradesh"];

export default function CheckoutForm({ prefill }: { prefill: Address | null }) {
  const router = useRouter();
  const toast = useGK((s) => s.toast);
  const refreshCounts = useGK((s) => s.refreshCounts);
  const [form, setForm] = useState<Address>({
    name: prefill?.name ?? "",
    phone: prefill?.phone ?? "",
    line1: prefill?.line1 ?? "",
    city: prefill?.city ?? "",
    state: prefill?.state ?? "Karnataka",
    pincode: prefill?.pincode ?? "",
  });
  const [method, setMethod] = useState<"cod" | "online">("cod");
  const [gateway, setGateway] = useState<GatewayState>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const e: Partial<Record<keyof Address, string>> = {};
    if (form.name.trim().length < 2) e.name = "Enter the receiver's name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "10-digit Indian mobile number";
    if (form.line1.trim().length < 6) e.line1 = "House no, street, area";
    if (form.city.trim().length < 2) e.city = "Enter your city";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submitOrder(simulate: "success" | "fail" = "success") {
    setServerError("");
    if (method === "online" && simulate === "fail") {
      setGateway("failed");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form, paymentMethod: method }),
      });
      const body = await res.json();
      if (!res.ok) {
        setGateway("idle");
        setServerError(body.message ?? "Couldn't place the order.");
        toast({ title: "Order failed", desc: body.message, tone: "warn" });
        return;
      }
      await refreshCounts();
      router.push(`/account/orders?placed=${body.order.id}`);
    } catch {
      setGateway("idle");
      setServerError("Network error. Your cart is preserved — try again.");
    }
  }

  async function placeOrder() {
    if (!validate()) return;
    if (method === "cod") {
      setGateway("processing");
      await submitOrder();
      return;
    }
    setGateway("processing");
    // Simulated Razorpay-style gateway round-trip
    setTimeout(() => submitOrder(), 1900);
  }

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      {/* Address */}
      <section className="card p-5 sm:p-6">
        <h3 className="flex items-center gap-2.5 font-display text-base font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-flame text-xs font-bold text-white">1</span>
          Delivery address
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name} className="sm:col-span-2">
            <input value={form.name} onChange={set("name")} placeholder="Receiver's name" className="input" />
          </Field>
          <Field label="Mobile number" error={errors.phone}>
            <div className="relative">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-mute">+91</span>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="98765 43210" inputMode="numeric" className="input !pl-12" />
            </div>
          </Field>
          <Field label="Pincode" error={errors.pincode}>
            <input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="560102" inputMode="numeric" className="input" />
          </Field>
          <Field label="Address (house no, street, area)" error={errors.line1} className="sm:col-span-2">
            <input value={form.line1} onChange={set("line1")} placeholder="42, 3rd Cross, HSR Layout Sector 2" className="input" />
          </Field>
          <Field label="City" error={errors.city}>
            <input value={form.city} onChange={set("city")} placeholder="Bengaluru" className="input" />
          </Field>
          <Field label="State">
            <select value={form.state} onChange={set("state")} className="input">
              {IN_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        {prefill && (
          <p className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-mute">
            <MapPin size={12} className="text-leaf-dark" /> Prefilled from your last order — edit anything you need.
          </p>
        )}
      </section>

      {/* Payment */}
      <section className="card p-5 sm:p-6">
        <h3 className="flex items-center gap-2.5 font-display text-base font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-flame text-xs font-bold text-white">2</span>
          Payment method
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod("cod")}
            className={`rounded-xl border-2 p-4 text-left transition-all ${method === "cod" ? "border-flame bg-flame-tint" : "border-line hover:border-flame/40"}`}
          >
            <div className="flex items-center justify-between">
              <Banknote size={20} className={method === "cod" ? "text-flame" : "text-mute"} />
              <span className={`h-4 w-4 rounded-full border-2 ${method === "cod" ? "border-flame bg-flame" : "border-line"}`} />
            </div>
            <div className="mt-2.5 text-sm font-bold">Cash on Delivery</div>
            <p className="mt-1 text-xs leading-relaxed text-mute">Pay by cash or UPI when the order reaches your door. No advance needed.</p>
          </button>
          <button
            type="button"
            onClick={() => setMethod("online")}
            className={`rounded-xl border-2 p-4 text-left transition-all ${method === "online" ? "border-flame bg-flame-tint" : "border-line hover:border-flame/40"}`}
          >
            <div className="flex items-center justify-between">
              <CreditCard size={20} className={method === "online" ? "text-flame" : "text-mute"} />
              <span className={`h-4 w-4 rounded-full border-2 ${method === "online" ? "border-flame bg-flame" : "border-line"}`} />
            </div>
            <div className="mt-2.5 text-sm font-bold">Pay Online</div>
            <p className="mt-1 flex items-center gap-1 text-xs leading-relaxed text-mute">
              <Smartphone size={11} /> UPI, cards & netbanking — encrypted gateway.
            </p>
          </button>
        </div>
        {serverError && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-chili/10 px-3.5 py-2.5 text-sm font-semibold text-chili">
            <XCircle size={15} /> {serverError}
          </p>
        )}
        <button onClick={placeOrder} disabled={gateway === "processing"} className="btn-primary mt-5 w-full !py-3.5 disabled:opacity-60">
          {gateway === "processing" ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
          {method === "cod" ? "Place order — pay on delivery" : "Proceed to pay"}
        </button>
        {method === "online" && (
          <button
            type="button"
            onClick={() => {
              if (!validate()) return;
              setGateway("failed");
            }}
            className="mt-2.5 w-full text-center text-[11px] font-semibold text-mute underline underline-offset-2 hover:text-chili"
          >
            Demo: simulate a declined payment to see the retry flow
          </button>
        )}
      </section>

      {/* Gateway overlay */}
      <AnimatePresence>
        {gateway !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="card w-full max-w-sm p-7 text-center"
            >
              {gateway === "processing" ? (
                <>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-flame-tint">
                    <Loader2 size={28} className="animate-spin text-flame" />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold">
                    {method === "cod" ? "Placing your order…" : "Processing payment…"}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-mute">
                    {method === "cod" ? "Confirming availability with the warehouse." : "GymKart Secure Gateway (demo) · Do not press back or refresh."}
                  </p>
                  <div className="mx-auto mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-sand">
                    <motion.div
                      className="h-full rounded-full bg-flame"
                      initial={{ width: "8%" }}
                      animate={{ width: ["8%", "62%", "88%"] }}
                      transition={{ duration: 1.8, ease: "easeInOut" }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-chili/10">
                    <XCircle size={30} className="text-chili" />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold">Payment failed</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-mute">
                    The bank declined the transaction (simulated). Don't worry — your cart is intact.
                  </p>
                  <button
                    onClick={() => {
                      setGateway("processing");
                      setTimeout(() => submitOrder(), 1600);
                    }}
                    className="btn-primary mt-5 w-full"
                  >
                    <RefreshCcw size={15} /> Retry payment
                  </button>
                  <button onClick={() => setGateway("idle")} className="btn-ghost mt-2.5 w-full !py-2.5 !text-xs">
                    Edit payment method
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-semibold ${className ?? ""}`}>
      {label}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs font-semibold text-chili">{error}</span>}
    </label>
  );
}
