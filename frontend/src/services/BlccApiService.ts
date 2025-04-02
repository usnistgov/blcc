import type { Output, RequestBuilder } from "@lrd/e3-sdk";
import type { Case } from "blcc-format/Format";
import {
    decodeDiscountRatesResponse,
    decodeEscalationRateResponse,
    decodeNumberArray,
    decodeReleaseYear,
    decodeZipInfoResponse,
} from "blcc-format/schema";
import { Console, Data, Effect } from "effect";

type RegionCaseRequest = {
    from: number;
    to: number;
    releaseYear: number;
    case: Case;
    rate: string;
};

export class FetchError extends Data.TaggedError("FetchError") {}

export class E3BuildError extends Data.TaggedError("E3BuildError")<{ message: string }> {}

export const jsonResponse = (response: Response) =>
    Effect.tryPromise({
        try: () => response.json(),
        catch: () => new FetchError(),
    });

export class BlccApiService extends Effect.Service<BlccApiService>()("BlccApiService", {
    effect: Effect.gen(function* () {
        const fetchRegionCase =
            <T>(url: string) =>
            (payload: RegionCaseRequest & T) =>
                Effect.tryPromise({
                    try: () =>
                        fetch(`/api/${url}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        }),
                    catch: () => new FetchError(),
                }).pipe(
                    Effect.filterOrFail(
                        (response) => response.ok,
                        () => new FetchError(),
                    ),
                    Effect.andThen(jsonResponse),
                    Effect.andThen(decodeNumberArray),
                );

        return {
            fetchReleaseYears: Effect.tryPromise({
                try: () => fetch("/api/release_year", { method: "GET" }),
                catch: () => new FetchError(),
            }).pipe(
                Effect.filterOrFail(
                    (response) => response.ok,
                    () => new FetchError(),
                ),
                Effect.andThen(jsonResponse),
                Effect.andThen(decodeReleaseYear),
            ),
            fetchEscalationRates: (releaseYear: number, from: number, to: number, eiaCase: Case, zip?: number) =>
                Effect.tryPromise({
                    try: () =>
                        fetch("/api/escalation_rates", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ releaseYear, from, to, zip, case: eiaCase }),
                        }),
                    catch: () => new FetchError(),
                }).pipe(
                    Effect.filterOrFail(
                        (response) => response.ok,
                        () => new FetchError(),
                    ),
                    Effect.andThen(jsonResponse),
                    Effect.andThen(decodeEscalationRateResponse),
                ),
            fetchRegionCaseBa: fetchRegionCase<{ ba: string }>("region_case_ba"),
            fetchRegionCaseReeds: fetchRegionCase<{ reeds: string }>("region_case_reeds"),
            fetchRegionCaseNatGas: fetchRegionCase<{ technobasin: string }>("region_natgas"),
            fetchRegionCaseOil: fetchRegionCase<{ padd: string }>("region_case_oil"),
            fetchRegionCasePropaneLng: fetchRegionCase<{ padd: string }>("region_case_propane_lng"),
            fetchOmbDiscountRates: (releaseYear: number) =>
                Effect.tryPromise({
                    try: () =>
                        fetch("/api/discount_rates", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ releaseYear, rate: "OMB" }),
                        }),
                    catch: () => new FetchError(),
                }).pipe(
                    Effect.filterOrFail(
                        (response) => response.ok,
                        () => new FetchError(),
                    ),
                    Effect.andThen(jsonResponse),
                    Effect.andThen(decodeDiscountRatesResponse),
                ),
            fetchDoeDiscountRates: (releaseYear: number) =>
                Effect.tryPromise({
                    try: () =>
                        fetch("/api/discount_rates", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ releaseYear, rate: "DOE" }),
                        }),
                    catch: () => new FetchError(),
                }).pipe(
                    Effect.filterOrFail(
                        (response) => response.ok,
                        () => new FetchError(),
                    ),
                    Effect.andThen(jsonResponse),
                    Effect.andThen(decodeDiscountRatesResponse),
                ),
            fetchEmissions: (releaseYear: number, zip: string, studyPeriod: number, eiaCase: Case) =>
                Effect.gen(function* () {
                    yield* Effect.log("Fetch emissions");
                    return yield* Effect.tryPromise({
                        try: () =>
                            fetch("/api/emissions", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    from: releaseYear,
                                    to: releaseYear + (studyPeriod ?? 0),
                                    releaseYear,
                                    zip: Number.parseInt(zip ?? "0"),
                                    case: eiaCase,
                                    rate: "Avg",
                                }),
                            }),
                        catch: () => new FetchError(),
                    }).pipe(
                        Effect.filterOrFail(
                            (response) => response.ok,
                            () => new FetchError(),
                        ),
                        Effect.andThen(jsonResponse),
                        Effect.andThen(decodeNumberArray),
                    );
                }),
            fetchZipInfo: (zip: number) =>
                Effect.tryPromise({
                    try: () =>
                        fetch("/api/zip_info", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ zip }),
                        }),
                    catch: () => new FetchError(),
                }).pipe(
                    Effect.filterOrFail(
                        (response) => response.ok,
                        () => new FetchError(),
                    ),
                    Effect.andThen(jsonResponse),
                    Effect.andThen(decodeZipInfoResponse),
                ),
            fetchE3Request: (builder: RequestBuilder) =>
                Effect.gen(function* () {
                    const request = yield* Effect.try({
                        try: () => builder.build(),
                        catch: (e) => new E3BuildError({ message: (e as Error).toString() }),
                    });

                    yield* Console.log("Sending E3 request", request);

                    const result = yield* Effect.tryPromise({
                        try: () =>
                            fetch("/api/e3_request", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ request: JSON.stringify(request) }),
                            }),
                        catch: () => new FetchError(),
                    }).pipe(
                        Effect.filterOrFail(
                            (response) => response.ok,
                            () => new FetchError(),
                        ),
                        Effect.andThen(jsonResponse),
                    );

                    yield* Console.log("Got E3 result", result);

                    return result as Output;
                }),
        };
    }),
}) {}
