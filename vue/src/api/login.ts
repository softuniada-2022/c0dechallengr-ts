import useSWRV, { mutate } from "swrv";
import type { UserClaim } from "@/models/User";
import { prefetchExercises } from "./exercise";
import { prefetchHelper } from "./_utils";

export function prefetchLogin(claim?: UserClaim) {
  return prefetchHelper("/api/login", claim);
}

export function useLogin() {
  const { data, error } = useSWRV<UserClaim>("/api/login");
  return { data, error };
}

export async function logIn(username: string, password: string): Promise<void> {
  const url = "/api/login";
  const body = JSON.stringify({ username, password });
  const resp = await fetch(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  prefetchLogin();
}

export async function logOut(): Promise<void> {
  const url = "/api/login";
  const resp = await fetch(url, { method: "DELETE" });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  mutate(url, Promise.resolve(null));
  prefetchExercises();
}
