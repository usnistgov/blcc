import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { bar, pie } from "billboard.js";
import { liveQuery } from "dexie";
import { alternatives$, hash$ } from "model/Model";
import { DexieService, db } from "model/db";
import { combineLatest, merge, switchMap } from "rxjs";
import { map } from "rxjs/operators";
import { guard } from "util/Operators";
import "billboard.js/dist/billboard.css";
import { Effect } from "effect";
import { e3Request } from "model/E3Request";
import { createAlternativeNameMap, groupOptionalByTag } from "util/Util";
import { BlccRuntime } from "util/runtime";

/**
 * Initializes all Billboard.js elements.
 */
function initializeBillboardJS() {
    bar();
    pie();
}
initializeBillboardJS();

export namespace ResultModel {
    export const [loading$, setLoading] = createSignal<boolean>();

    export namespace Actions {
        export function run() {
            BlccRuntime.runPromise(
                Effect.gen(function* () {
                    setLoading(true);

                    const db = yield* DexieService;

                    const results = yield* e3Request;
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

    export const alternativeNames$ = alternatives$.pipe(map(createAlternativeNameMap));

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
    export const [useOptions] = bind(
        alternatives$.pipe(
            map((alternatives) =>
                alternatives.map((alternative) => ({ value: alternative.id ?? 0, label: alternative.name })),
            ),
        ),
        [],
    );
    export const [useSelection] = bind(selection$, 0);

    export const measures$ = result$.pipe(map((data) => data?.measure ?? []));

    export const selectedMeasure$ = combineLatest([measures$, selection$]).pipe(
        map(([measures, selection]) => measures.find((measure) => measure.altId === selection)),
        guard(),
    );

    export const optionals$ = result$.pipe(map((data) => data?.optional ?? []));
    export const optionalsByTag$ = optionals$.pipe(map((optionals) => groupOptionalByTag(optionals)));
}
