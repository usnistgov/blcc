import type { Optional } from "@lrd/e3-sdk";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { bar, pie } from "billboard.js";
import { result$ } from "components/ResultsAppBar";
import { liveQuery } from "dexie";
import { alternatives$ } from "model/Model";
import { db } from "model/db";
import { combineLatest, merge, switchMap } from "rxjs";
import { map } from "rxjs/operators";
import { guard } from "util/Operators";
import "billboard.js/dist/billboard.css";

/**
 * Initializes all Billboard.js elements.
 */
function initializeBillboardJS() {
    bar();
    pie();
}
initializeBillboardJS();

export const required$ = result$.pipe(map((data) => data?.required ?? []));

export const alternativeNames$ = alternatives$.pipe(
    map((alternatives) => new Map(alternatives.map((x) => [x.id ?? 0, x.name]))),
);

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
export const optionalsByTag$ = optionals$.pipe(
    map(
        (optionals) =>
            new Map<string, Optional>(optionals.map((optional) => [`${optional.altId} ${optional.tag}`, optional])),
    ),
);
