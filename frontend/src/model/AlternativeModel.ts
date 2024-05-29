import { bind, state } from "@react-rxjs/core";
import { liveQuery } from "dexie";
import { BehaviorSubject, distinctUntilChanged, switchMap } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { arrayFilter, guard } from "../util/Operators";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { db } from "./db";

/**
 * The ID of the currently selected alternative as denoted in the URL.
 */
export const sAlternativeID$ = new BehaviorSubject<number>(0);

export const [useAlternativeID, altID$] = bind(sAlternativeID$, 0);

export const alternativeCollection$ = sAlternativeID$.pipe(map((id) => db.alternatives.where("id").equals(id)));

/**
 * The current alternative object that relates to the currently selected ID.
 */
export const alternative$ = sAlternativeID$.pipe(
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

export const [useAltName] = bind(alternative$.pipe(map((alt) => alt.name)), "");

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
