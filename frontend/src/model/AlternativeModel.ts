import { bind, state } from "@react-rxjs/core";
import { liveQuery } from "dexie";
import { BehaviorSubject, Subject, distinctUntilChanged, merge, switchMap } from "rxjs";
import { map, shareReplay, tap, withLatestFrom } from "rxjs/operators";
import { arrayFilter, defaultValue, guard } from "../util/Operators";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { db } from "./db";

export namespace AlternativeModel {
    /**
     * The ID of the currently selected alternative as denoted in the URL.
     */
    export const sID$ = new BehaviorSubject<number>(0);

    export const [useID, ID$] = bind(sID$, 0);

    export const collection$ = sID$.pipe(map((id) => db.alternatives.where("id").equals(id)));

    /**
     * The current alternative object that relates to the currently selected ID.
     */
    export const alternative$ = sID$.pipe(
        distinctUntilChanged(),
        switchMap((id) => liveQuery(() => db.alternatives.where("id").equals(id).first())),
        guard(),
        shareReplay(1),
    );

    /**
     * The list of costs associated with the current alternative.
     */
    export const altCosts$ = alternative$.pipe(
        tap((x) => console.log("alternative updated", x)),
        switchMap((alt) => liveQuery(() => db.costs.where("id").anyOf(alt.costs).toArray())),
        shareReplay(1),
    );

    /**
     * The energy costs of the current alternative.
     */
    export const energyCosts$ = state(altCosts$.pipe(arrayFilter(isEnergyCost)), []);

    /**
     * The water costs of the current alternative.
     */
    export const waterCosts$ = state(altCosts$.pipe(arrayFilter(isWaterCost)), []);

    /**
     * The capital costs of the current alternative.
     */
    export const capitalCosts$ = state(altCosts$.pipe(arrayFilter(isCapitalCost)), []);

    /**
     * The contract costs of the current alternative.
     */
    export const contractCosts$ = state(altCosts$.pipe(arrayFilter(isContractCost)), []);

    /**
     * The other costs of the current alternative.
     */
    export const otherCosts$ = state(altCosts$.pipe(arrayFilter(isOtherCost)), []);

    export const sName$ = new Subject<string | undefined>();
    const newName$ = sName$.pipe(defaultValue("Unnamed Alternative"));
    export const name$ = state(
        merge(newName$, alternative$.pipe(map((alternative) => alternative?.name))).pipe(distinctUntilChanged()),
        undefined,
    );
    newName$.pipe(withLatestFrom(collection$)).subscribe(([name, collection]) => collection.modify({ name }));

    export const sDescription$ = new Subject<string | undefined>();
    export const description$ = state(
        merge(sDescription$, alternative$.pipe(map((alternative) => alternative?.description))).pipe(
            distinctUntilChanged(),
        ),
    );
    sDescription$
        .pipe(withLatestFrom(collection$))
        .subscribe(([description, collection]) => collection.modify({ description }));
}
