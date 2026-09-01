"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GKUser = { id: string; email: string; name: string; role: string; fitnessGoal: string | null };

export type GuestItem = { productId: string; qty: number };

export type Toast = {
  id: number;
  title: string;
  desc?: string;
  href?: string;
  hrefLabel?: string;
  tone?: "ok" | "info" | "warn";
};

type State = {
  user: GKUser | null;
  guestCart: GuestItem[];
  serverCartCount: number;
  wishlistIds: string[];
  toasts: Toast[];
  bootstrapped: boolean;
  setUser: (u: GKUser | null) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  bootstrap: () => Promise<void>;
  afterAuth: (u: GKUser) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  setGuestQty: (productId: string, qty: number) => void;
  clearGuestCart: () => void;
  refreshCounts: () => Promise<void>;
  setWishlistIds: (ids: string[]) => void;
};

let toastId = 0;

export const useGK = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      guestCart: [],
      serverCartCount: 0,
      wishlistIds: [],
      toasts: [],
      bootstrapped: false,

      setUser: (user) => set({ user }),

      toast: (t) => {
        const id = ++toastId;
        set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
        setTimeout(() => get().dismissToast(id), 3600);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      bootstrap: async () => {
        if (get().bootstrapped) return;
        set({ bootstrapped: true });
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          const { user } = await res.json();
          if (user) await get().afterAuth(user);
        } catch { /* offline */ }
      },

      afterAuth: async (user) => {
        set({ user });
        const guest = get().guestCart;
        if (guest.length) {
          try {
            await fetch("/api/cart?sync=1", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(guest),
            });
            if (guest.length) get().toast({ title: "Cart merged", desc: "Items from your guest session were added.", tone: "info" });
          } catch { /* ignore */ }
          set({ guestCart: [] });
        }
        await get().refreshCounts();
      },

      logout: async () => {
        try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
        set({ user: null, serverCartCount: 0, wishlistIds: [] });
        get().toast({ title: "Signed out", tone: "info" });
      },

      refreshCounts: async () => {
        if (!get().user) return;
        try {
          const [cartRes, wishRes] = await Promise.all([
            fetch("/api/cart", { cache: "no-store" }),
            fetch("/api/wishlist", { cache: "no-store" }),
          ]);
          if (cartRes.ok) {
            const { items } = await cartRes.json();
            set({ serverCartCount: items.reduce((a: number, l: { quantity: number }) => a + l.quantity, 0) });
          }
          if (wishRes.ok) {
            const { items } = await wishRes.json();
            set({ wishlistIds: items.map((i: { product: { id: string } }) => i.product.id) });
          }
        } catch { /* offline */ }
      },

      setWishlistIds: (ids) => set({ wishlistIds: ids }),

      addToCart: async (productId, qty = 1) => {
        const s = get();
        if (!s.user) {
          const cur = s.guestCart.find((g) => g.productId === productId);
          set((st) => ({
            guestCart: cur
              ? st.guestCart.map((g) => (g.productId === productId ? { ...g, qty: Math.min(g.qty + qty, 10) } : g))
              : [...st.guestCart, { productId, qty }],
          }));
          s.toast({ title: "Added to cart", desc: "Sign in at checkout to save your cart.", href: "/cart", hrefLabel: "View cart", tone: "ok" });
          return;
        }
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, qty }),
          });
          if (res.status === 401) {
            set({ user: null });
            return get().addToCart(productId, qty);
          }
          const { items } = await res.json();
          set({ serverCartCount: items.reduce((a: number, l: { quantity: number }) => a + l.quantity, 0) });
          get().toast({ title: "Added to cart", href: "/cart", hrefLabel: "View cart", tone: "ok" });
        } catch {
          get().toast({ title: "Network error", desc: "Couldn't reach the server. Try again.", tone: "warn" });
        }
      },

      setGuestQty: (productId, qty) =>
        set((s) => ({
          guestCart: qty <= 0
            ? s.guestCart.filter((g) => g.productId !== productId)
            : s.guestCart.map((g) => (g.productId === productId ? { ...g, qty } : g)),
        })),

      clearGuestCart: () => set({ guestCart: [] }),
    }),
    {
      name: "gymkart",
      partialize: (s) => ({ guestCart: s.guestCart }),
    },
  ),
);

export const selectCartCount = (s: State) =>
  s.user ? s.serverCartCount : s.guestCart.reduce((a, g) => a + g.qty, 0);
