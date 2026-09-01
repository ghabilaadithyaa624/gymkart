import { cache } from "react";
import { serverFetch } from "./api";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  fitnessGoal: string | null;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const data = await serverFetch<{ user: SessionUser | null }>("/api/auth/me");
  return data?.user ?? null;
});
