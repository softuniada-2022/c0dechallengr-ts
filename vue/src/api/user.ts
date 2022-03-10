import type User from "@/models/User";
import useSWRV from "swrv";
import { logIn } from "@/api/login";
import { prefetchHelper } from "./_utils";

export function prefetchUsers() {
  return prefetchHelper("/api/users");
}

export function prefetchUser(username: string, data?: User) {
  return prefetchHelper(`/api/users/${username}`, data);
}

export function useUsers({
  sortBy = "createdAt",
  order = "DESC",
  limit = 0,
  skip = 0,
}: {
  sortBy?: "username" | "score" | "createdAt";
  order?: "ASC" | "DESC";
  limit?: number;
  skip?: number;
} = {}) {
  const baseUrl = "/api/users";
  const url = `${baseUrl}?sort=${encodeURIComponent(
    sortBy
  )}&order=${encodeURIComponent(order)}&limit=${encodeURIComponent(
    limit
  )}&skip=${encodeURIComponent(skip)}`;
  const { data, error } = useSWRV<User[]>(baseUrl, () =>
    fetch(url).then((r) => r.json())
  );
  data.value?.forEach((user) => prefetchUser(user.username));
  return { data, error };
}

export function useUser(username: string) {
  const { data, error } = useSWRV<User>(`/api/users/${username}`);
  return { data, error };
}

export async function signUp(
  username: string,
  email: string,
  password: string,
  logInAfterSignUp = true
): Promise<void> {
  const url = "/api/users";
  if (password === "") {
    throw Error("Password cannot be empty");
  }
  if (email === "") {
    throw Error("Email cannot be empty");
  }
  if (username === "") {
    throw Error("Username cannot be empty");
  }
  const body = JSON.stringify({
    username,
    email,
    password,
  });
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
  if (logInAfterSignUp) {
    await logIn(username, password);
  }
}
