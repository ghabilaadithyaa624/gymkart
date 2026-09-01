import { redirect } from "next/navigation";
import WishlistView from "@/components/wishlist-view";
import { getSessionUser } from "@/lib/auth";
import { getWishlist } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wishlist — GymKart" };

export default async function WishlistPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/wishlist");
  const items = await getWishlist(user.id);
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Wishlist <span className="ml-1 text-base font-medium text-mute">({items.length} saved)</span>
      </h1>
      <WishlistView initialItems={items.map((i) => i.product)} />
    </main>
  );
}
