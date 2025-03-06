import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { bar, pie } from "billboard.js";
import { liveQuery } from "dexie";
import { alternatives$, hash$ } from "model/Model";
import { DexieService, db } from "model/db";
import { combineLatest, merge, switchMap } from "rxjs";
import { map, shareReplay, startWith, withLatestFrom } from "rxjs/operators";
import { guard } from "util/Operators";
import "billboard.js/dist/billboard.css";
import { Effect } from "effect";
import { E3ObjectService } from "services/E3ObjectService";
import { createAlternativeNameMap, groupOptionalByTag } from "util/Util";
import { BlccRuntime } from "util/runtime";

/**
 * Initializes all Billboard.js elements.
 */
function initializeBillboardJS() {
    bar();
    pie();
    console.log("initBillboard");
}
initializeBillboardJS();

export namespace ResultModel {
    export const [loading$, setLoading] = createSignal<boolean>();

    export namespace Actions {
        export function run() {
            BlccRuntime.runPromise(
                Effect.gen(function* () {
                    setLoading(true);

                    const e3ObjectService = yield* E3ObjectService;
                    const db = yield* DexieService;

                    const results = yield* e3ObjectService.request;
                    const timestamp = new Date();
                    const hash = yield* db.hashCurrent;

                    if (hash === undefined) return;

                    yield* db.clearResults;
                    yield* db.addResult(hash, timestamp, results);
                }),
            );
        }
    }

    // Result stream that pulls from cache if available.
    export const result$ = hash$.pipe(switchMap((hash) => liveQuery(() => db.results.get(hash))));
    export const [noResult] = bind(result$.pipe(map((result) => result === undefined)), true);
    export const [hasError] = bind(
        result$.pipe(map((result) => result !== undefined && !("measure" in result))),
        false,
    );

    hash$.subscribe((x) => console.log("Hash", x));

    // True if the project has been run before, if anything has changed since, false.
    export const isCached$ = result$.pipe(map((result) => result !== undefined));

    /**
     * The timestamp that the result was received at.
     */
    export const [useTimestamp] = bind(result$.pipe(map((result) => result?.timestamp)), undefined);

    /**
     * True if a request has been sent but not response has been received yet, otherwise false.
     */
    export const [isLoading] = bind(merge(loading$, result$.pipe(map(() => false))), false);

    export const required$ = result$.pipe(map((data) => data?.required ?? []));
    export const [useRequired] = bind(required$, []);

    export const alternativeNames$ = alternatives$.pipe(map(createAlternativeNameMap));
    export const [useAlternativeNames] = bind(alternativeNames$, new Map<number, string>());

    export const [selectChange$, selectAlternative] = createSignal<number>();
    export const selection$ = merge(selectChange$, alternatives$.pipe(map((alternatives) => alternatives[0].id ?? 0)));

    export const selectedAlternative$ = selection$.pipe(
        switchMap((id) => liveQuery(() => db.alternatives.get(id))),
        guard(),
    );
    export const selectedRequired$ = combineLatest([required$, selection$]).pipe(
        map(([required, id]) => required.find((value) => value.altId === id)),
        guard(),
    );
    export const [useAlternativeOptions] = bind(
        alternatives$.pipe(
            map((alternatives) =>
                alternatives.map((alternative) => ({
                    value: alternative.id ?? 0,
                    label: alternative.name,
                })),
            ),
        ),
        [],
    );
    export const [useSelection] = bind(selection$, 0);

    export const measures$ = result$.pipe(map((data) => data?.measure ?? []));
    export const [useMeasures] = bind(measures$, []);

    export const selectedMeasure$ = combineLatest([measures$, selection$]).pipe(
        map(([measures, selection]) => measures.find((measure) => measure.altId === selection)),
        guard(),
        shareReplay(1),
    );

    export const [useSelectedMeasure] = bind(selectedMeasure$);

    export const optionals$ = result$.pipe(map((data) => data?.optional ?? []));
    export const optionalsByTag$ = optionals$.pipe(map((optionals) => groupOptionalByTag(optionals)));
    export const [useOptionalsByTag] = bind(optionalsByTag$, new Map());

    export const [discountedCashFlow$, setDiscountedCashFlow] = createSignal<boolean>();
    export const [useDiscountedCashFlow] = bind(discountedCashFlow$, true);

    export const categories = [
        "Initial Investment",
        "Energy",
        "Demand Charge",
        "Rebate",
        "Usage",
        "Disposal",
        "OMR",
        "Recurring Contract Cost",
        "Implementation Contract Cost",
        "Replacement Capital",
        "Residual Value",
        "Other",
    ];

    /* Map optional tags to display friendly names */
    export const categoryToDisplayName = new Map<string, string>([
        ["Initial Investment", "Investment"],
        ["Energy", "Energy Consumption"],
        ["Demand Charge", "Energy Demand"],
        ["Rebate", "Energy Rebates"],
        ["Usage", "Water Usage"],
        ["Disposal", "Water Disposal"],
        ["OMR", "OMR"],
        ["Recurring Contract Cost", "Recurring Contract"],
        ["Implementation Contract Cost", "Non-Recurring Contract"],
        ["Replacement Capital", "Replacement Capital"],
        ["Residual Value", "Residual Value"],
        ["Other", "Other"],
    ]);

    function arrayIsZero(arr: number[]) {
        return arr.reduce((acc, currVal) => acc + currVal) === 0;
    }

    export const categoryOptions$ = optionals$.pipe(
        withLatestFrom(selection$), // need to know which alternative is selected
        map(([optionals, selection]) =>
            optionals
                .filter((optional) => optional.altId === selection && !arrayIsZero(optional.totalTagCashflowDiscounted)) // filter to use data for current alternative and exclude data of only zeroes
                .map((optional) => optional.tag),
        ), // only need tag name
        map((tags) => categories.filter((category) => tags.includes(category))), // only use category for current alternative and populated optionals
        map((categories) =>
            categories.map((category) => ({
                value: category,
                label: categoryToDisplayName.get(category) ?? "",
            })),
        ), // format for consumption by dropdown
    );
    export const [useCategoryOptions] = bind(categoryOptions$, []);

    // Currently selected cost type by Tag/Object by Year
    export const [categorySelectionSignal, setCategorySelection] = createSignal<string>();
    // Should start by default selection of the first cost type for the alternative and populated cost types
    export const [useCategorySelection, categorySelection$] = bind(
        merge(categorySelectionSignal, categoryOptions$.pipe(map((categories) => categories[0].value))),
    );
}
