import type { Case } from "blcc-format/Format";
import {
    decodeDiscountRatesResponse,
    decodeEscalationRateResponse,
    decodeNumberArray,
    decodeReleaseYear,
} from "blcc-format/schema";
import { Data, Effect } from "effect";

class FetchError extends Data.TaggedError("FetchError") {}

export const jsonResponse = (response: Response) =>
    Effect.tryPromise({
        try: () => response.json(),
        catch: () => new FetchError(),
    });

export const fetchReleaseYears = Effect.tryPromise({
    try: () => fetch("/api/release_year", { method: "GET" }),
    catch: () => new FetchError(),
}).pipe(Effect.andThen(jsonResponse), Effect.andThen(decodeReleaseYear));

export const fetchEscalationRates = (releaseYear: number, from: number, to: number, zip: number, eiaCase: Case) =>
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
    }).pipe(Effect.andThen(jsonResponse), Effect.andThen(decodeEscalationRateResponse));

type RegionCaseRequest = {
    from: number;
    to: number;
    releaseYear: number;
    case: Case;
    rate: string;
};

export const fetchRegionCase =
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
        }).pipe(Effect.andThen(jsonResponse), Effect.andThen(decodeNumberArray));

export const fetchRegionCaseBa = fetchRegionCase<{ ba: string }>("region_case_ba");
export const fetchRegionCaseReeds = fetchRegionCase<{ reeds: string }>("region_case_reeds");
export const fetchRegionCaseNatGas = fetchRegionCase<{ technobasin: string }>("region_natgas");
export const fetchRegionCaseOil = fetchRegionCase<{ padd: string }>("region_case_oil");
export const fetchRegionCasePropaneLng = fetchRegionCase<{ padd: string }>("region_case_propane_lng");

export const fetchOmbDiscountRates = (releaseYear: number) =>
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
    }).pipe(Effect.andThen(jsonResponse), Effect.andThen(decodeDiscountRatesResponse));

export const fetchDoeDiscountRates = (releaseYear: number) =>
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
    }).pipe(Effect.andThen(jsonResponse), Effect.andThen(decodeDiscountRatesResponse));

export const fetchScc = (releaseYear: number, from: number, to: number, option: string) =>
    Effect.tryPromise({
        try: () =>
            fetch("/api/scc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ releaseYear, from, to, option }),
            }),
        catch: () => new FetchError(),
    }).pipe(Effect.andThen(jsonResponse), Effect.andThen(decodeNumberArray));
