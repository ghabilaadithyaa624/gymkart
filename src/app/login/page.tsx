import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in — GymKart" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/account");
  return (
    <main className="mx-auto grid max-w-7xl place-items-center px-4 py-14 sm:px-6">
      <LoginForm />
    </main>
  );
}
