import type Exercise from "@/models/Exercise";
import type { NewSolution } from "@/models/Solution";
import type Solution from "@/models/Solution";
import useSWRV from "swrv";
import { prefetchHelper } from "./_utils";

export function prefetchSolutions(exerciseId: number) {
  return prefetchHelper(
    `/api/solutions?exerciseId=${encodeURIComponent(exerciseId)}`
  );
}

export function useSolutions(
  exerciseId: number,
  {
    limit = 0,
    skip = 0,
  }: {
    limit?: number;
    skip?: number;
  } = {}
) {
  const baseUrl = `/api/solutions?exerciseId=${encodeURIComponent(exerciseId)}`;
  const url = `${baseUrl}&limit=${encodeURIComponent(
    limit
  )}&skip=${encodeURIComponent(skip)}`;
  const { data, error } = useSWRV<Solution[]>(baseUrl, () =>
    fetch(url).then((r) => r.json())
  );
  return { data, error };
}

export async function submitSolution(
  exercise: Exercise,
  solution: NewSolution
) {
  const url = `/api/solutions?exerciseId=${encodeURIComponent(exercise.id)}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(solution),
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  await prefetchSolutions(exercise.id);
}
