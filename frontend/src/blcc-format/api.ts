import { Effect } from "effect";

export const jsonResponse = (response: Response) => Effect.tryPromise(() => response.json());

export const fetchReleaseYears = Effect.promise(() => fetch("/api/release_year", { method: "GET" }));
