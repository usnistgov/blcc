import { urlParameters$ } from "../components/UrlParameters";
import { map } from "rxjs/operators";
import { switchMap } from "rxjs";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { arrayFilter, guard } from "../util/Operators";
import { bind } from "@react-rxjs/core";
import { db } from "./db";
import { liveQuery } from "dexie";

/**
 * The ID of the currently selected alternative as denoted in the URL.
 */
export const alternativeID$ = urlParameters$.pipe(map(({ alternativeID }) => (alternativeID ? +alternativeID : -1)));

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
    switchMap((alt) => liveQuery(() => db.costs.where("id").anyOf(alt.costs).toArray()))
);
export const [useAltCosts] = bind(altCosts$, []);

export const [useAltName] = bind(alternative$.pipe(map((alt) => alt.name)), "");

/**
 * The energy costs of the current alternative.
 */
export const energyCosts$ = altCosts$.pipe(arrayFilter(isEnergyCost));

/**
 * The water costs of the current alternative.
 */
export const waterCosts$ = altCosts$.pipe(arrayFilter(isWaterCost));

/**
 * The capital costs of the current alternative.
 */
export const capitalCosts$ = altCosts$.pipe(arrayFilter(isCapitalCost));

/**
 * The contract costs of the current alternative.
 */
export const contractCosts$ = altCosts$.pipe(arrayFilter(isContractCost));

/**
 * The other costs of the current alternative.
 */
export const otherCosts$ = altCosts$.pipe(arrayFilter(isOtherCost));
