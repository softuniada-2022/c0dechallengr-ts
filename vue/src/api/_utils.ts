import { mutate } from "swrv";

export function prefetchHelper<T>(url: string, data?: T): Promise<T> {
  const dataPromise = data
    ? Promise.resolve(data)
    : fetch(url).then((r) => r.json());
  mutate(url, dataPromise);
  return dataPromise;
}
