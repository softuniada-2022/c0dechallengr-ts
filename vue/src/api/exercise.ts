import type { NewExercise } from "@/models/Exercise";
import type Exercise from "@/models/Exercise";
import useSWRV from "swrv";
import { prefetchSolutions } from "./solution";
import { prefetchHelper } from "./_utils";

export function prefetchExercises() {
  return prefetchHelper("/api/exercises");
}

export function prefetchExercise(id: number, data?: Exercise) {
  return prefetchHelper(`/api/exercises/${id}`, data);
}

export function prefetchLikes(id: number, data?: number) {
  return prefetchHelper(`/api/exercises/${id}/likes`, data);
}

export function prefetchLiked(id: number, data?: boolean) {
  return prefetchHelper(`/api/exercises/${id}/liked`, data);
}

export function useExercises({
  sortBy = "createdAt",
  order = "DESC",
  limit = 0,
  skip = 0,
}: {
  sortBy?: "likeCount" | "createdAt";
  order?: "ASC" | "DESC";
  limit?: number;
  skip?: number;
} = {}) {
  const baseUrl = "/api/exercises";
  const url = `${baseUrl}?sort=${encodeURIComponent(
    sortBy
  )}&order=${encodeURIComponent(order)}&limit=${encodeURIComponent(
    limit
  )}&skip=${encodeURIComponent(skip)}`;
  const { data, error } = useSWRV<Exercise[]>(baseUrl, () =>
    fetch(url).then((r) => r.json())
  );
  data.value?.forEach((exercise) => {
    prefetchExercise(exercise.id);
    prefetchSolutions(exercise.id);
  });
  return { data, error };
}

export function useExercise(id: number) {
  const { data, error } = useSWRV<Exercise>(`/api/exercises/${id}`);
  return { data, error };
}

export function useLikes(id: number) {
  const { data, error } = useSWRV<number>(
    `/api/exercises/${id}/likes`,
    undefined,
    {
      refreshInterval: 5_000,
    }
  );
  return { data, error };
}

export function useLiked(id: number) {
  const { data, error } = useSWRV<boolean>(`/api/exercises/${id}/liked`);
  return { data, error };
}

export async function likeExercise(
  exercise: Exercise,
  currentLikes: number
): Promise<void> {
  const url = `/api/exercises/${exercise.id}/like`;
  const ok = await fetch(url, { method: "POST" }).then((r) => r.ok);
  if (ok) {
    await prefetchLiked(exercise.id, true);
    await prefetchLikes(exercise.id, currentLikes);
    await prefetchLiked(exercise.id);
    await prefetchLikes(exercise.id);
  }
}

export async function unlikeExercise(exercise: Exercise, currentLikes: number) {
  const url = `/api/exercises/${exercise.id}/like`;
  const ok = await fetch(url, { method: "DELETE" }).then((r) => r.ok);
  if (ok) {
    await prefetchLiked(exercise.id, false);
    await prefetchLikes(exercise.id, Math.max(0, currentLikes - 1));
    await prefetchLiked(exercise.id);
    await prefetchLikes(exercise.id);
  }
}

export async function createExercise(exercise: NewExercise): Promise<number> {
  const url = "/api/exercises";
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exercise),
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  const id = ((await resp.json()) as Exercise).id;
  await prefetchExercise(id);
  return id;
}
