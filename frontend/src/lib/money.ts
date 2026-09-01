const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(amount: number): string {
  return `₹${inr.format(amount)}`;
}

export function discountPct(price: number, discountPrice: number | null): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function sellingPrice(p: { price: number; discountPrice: number | null }): number {
  return p.discountPrice ?? p.price;
}

export function formatCount(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 49;
export const GOALS = [
  { key: "weight_loss", label: "Weight Loss" },
  { key: "muscle_gain", label: "Muscle Gain" },
  { key: "general_fitness", label: "General Fitness" },
] as const;

export const BADGE_TAGS = ["bestseller", "new", "flash"] as const;
