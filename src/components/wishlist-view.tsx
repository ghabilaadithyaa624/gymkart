"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";
import type { Product } from "@/lib/shop";
import { useGK } from "@/lib/store";
import ProductCard from "./product-card";
import { EmptyState } from "./ui";

export default function WishlistView({ initialItems }: { initialItems: Product[] }) {
  const wishlistIds = useGK((s) => s.wishlistIds);
  const bootstrapped = useGK((s) => s.bootstrapped);

  const items = useMemo(() => {
    if (!bootstrapped || wishlistIds.length === 0 && initialItems.length > 0) return initialItems;
    return initialItems.filter((p) => wishlistIds.includes(p.id));
  }, [initialItems, wishlistIds, bootstrapped]);

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<Heart size={30} />}
          title="Nothing saved yet"
          desc="Tap the heart icon on any product to save it here for later."
          href="/products"
          cta="Explore products"
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
