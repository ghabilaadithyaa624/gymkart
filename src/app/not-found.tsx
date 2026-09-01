import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-md place-items-center px-6 py-24 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-flame-tint text-flame">
        <SearchX size={30} />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold">That rep didn't count — page not found</h1>
      <p className="mt-2 text-sm text-mute">
        The product or page you're looking for has been moved, renamed, or never existed.
      </p>
      <Link href="/" className="btn-primary mt-7">
        <ArrowLeft size={15} /> Back to GymKart
      </Link>
    </main>
  );
}
