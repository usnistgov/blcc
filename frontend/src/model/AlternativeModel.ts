import { filter, map } from "rxjs/operators";
import { BehaviorSubject, Subject, combineLatest, switchMap } from "rxjs";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { arrayFilter, guard } from "../util/Operators";
import { bind, shareLatest, state } from "@react-rxjs/core";
import { db } from "./db";
import { liveQuery } from "dexie";

/**
 * The ID of the currently selected alternative as denoted in the URL.
 */
export const alternativeID$ = new BehaviorSubject<number>(0);

export const [useAlternativeID, altID$] = bind(alternativeID$, 0);

export const alternativeCollection$ = alternativeID$.pipe(map((id) => db.alternatives.where("id").equals(id)));

/**
 * The current alternative object that relates to the currently selected ID.
 */
export const alternative$ = alternativeID$.pipe(
    switchMap((id) => liveQuery(() => db.alternatives.where("id").equals(id).first())),
    guard()
);

/**
 * The list of costs associated with the current alternative.
 */
export const altCosts$ = alternative$.pipe(
    switchMap((alt) => liveQuery(() => db.costs.where("id").anyOf(alt.costs).toArray())),
    shareLatest()
);
export const [useAltCosts] = bind(altCosts$, []);

export const [useAltName, altNameBind$] = bind(alternative$.pipe(map((alt) => alt.name)), "");

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

export const [isLoaded, isLoaded$] = bind(combineLatest([
    altNameBind$.pipe(filter((name) => name !== "")),
    altCosts$.pipe(filter((costs) => costs.length > 0)),
]).pipe(map(() => true)), false);
