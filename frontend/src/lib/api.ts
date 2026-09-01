import { cookies } from "next/headers";

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

/**
 * Server-side fetcher that forwards user cookies (e.g. gk_session) to the Express backend.
 */
export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string>),
    };

    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const fullUrl = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
    const res = await fetch(fullUrl, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[serverFetch] Error fetching ${path}:`, err);
    return null;
  }
}
