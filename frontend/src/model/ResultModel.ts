import type { Optional } from "@lrd/e3-sdk";
import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { bar, pie } from "billboard.js";
import { liveQuery } from "dexie";
import { alternatives$, currentProject$, hash$ } from "model/Model";
import { db } from "model/db";
import { Subject, combineLatest, merge, switchMap } from "rxjs";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";
import { guard } from "util/Operators";
import "billboard.js/dist/billboard.css";
import { E3Request, toE3Object } from "model/E3Request";
import { createAlternativeNameMap, groupOptionalByTag } from "util/Util";

/**
 * Initializes all Billboard.js elements.
 */
function initializeBillboardJS() {
    bar();
    pie();
}
initializeBillboardJS();

export namespace ResultModel {
    export const sRun$ = new Subject<void>();

    export namespace Actions {
        export function run() {
            sRun$.next();
        }
    }

    // Result stream that pulls from cache if available.
    export const result$ = hash$.pipe(switchMap((hash) => liveQuery(() => db.results.get(hash))));
    export const [useResult] = bind(result$, undefined);
    export const [noResult] = bind(result$.pipe(map((result) => result === undefined)), true);

    // True if the project has been run before, if anything has changed since, false.
    export const isCached$ = result$.pipe(map((result) => result !== undefined));

    // Send the E3 request when the run button is clicked
    export const e3Result$ = sRun$.pipe(
        withLatestFrom(currentProject$),
        map(([, id]) => id),
        toE3Object(),
        tap((x) => console.log("E3 Object: ", x)),
        E3Request(),
        tap((x) => console.log("E3 Result: ", x)),
        shareLatest(),
    );

    // Store the E3 result into the database with the hash of the project file to identify it.
    ResultModel.e3Result$.pipe(withLatestFrom(hash$)).subscribe(async ([result, hash]) => {
        const timestamp = new Date();
        await db.results.delete(hash);
        await db.results.add({ hash, timestamp, ...result });
    });

    /**
     * The timestamp that the result was received at.
     */
    export const [useTimestamp] = bind(result$.pipe(map((result) => result?.timestamp)), undefined);

    /**
     * True if a request has been sent but not response has been received yet, otherwise false.
     */
    export const [isLoading] = bind(merge(sRun$.pipe(map(() => true)), e3Result$.pipe(map(() => false))), false);

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
