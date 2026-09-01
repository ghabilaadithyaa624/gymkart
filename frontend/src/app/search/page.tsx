import CatalogView from "@/components/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search — GymKart" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  if (!q.trim()) return <CatalogView searchParams={sp} title="Browse all products" />;
  return <CatalogView searchParams={sp} q={q} />;
}
