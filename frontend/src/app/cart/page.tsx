import { getSessionUser } from "@/lib/auth";
import { getCart } from "@/lib/shop";
import CartView from "@/components/cart-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Cart — GymKart" };

export default async function CartPage() {
  const user = await getSessionUser();
  const items = user ? await getCart(user.id) : null;
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Your Cart</h1>
      <CartView isAuthed={Boolean(user)} initialItems={items} />
    </main>
  );
}
