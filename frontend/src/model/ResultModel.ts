import { result$ } from "../components/ResultsAppBar";
import { map } from "rxjs/operators";
import { alternatives$ } from "./Model";
import { createSignal } from "@react-rxjs/utils";
import { combineLatest, merge, switchMap } from "rxjs";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";

export const required$ = result$.pipe(map((data) => data?.required ?? []));

export const alternativeNames$ = alternatives$.pipe(
    map((alternatives) => new Map(alternatives.map((x) => [x.id ?? 0, x.name])))
);

export const [selectChange$, selectAlternative] = createSignal<number>();
export const selection$ = merge(selectChange$, alternatives$.pipe(map((alternatives) => alternatives[0].id ?? 0)));

export const selectedAlternative$ = selection$.pipe(
    switchMap((id) => liveQuery(() => db.alternatives.get(id))),
    guard()
);
export const selectedRequired$ = combineLatest([required$, selection$]).pipe(
    map(([required, id]) => required.find((value) => value.altId === id)),
    guard()
);

export const measures$ = result$.pipe(map((data) => data?.measure ?? []));
