import { urlParameters$ } from "../components/UrlParameters";
import { map, withLatestFrom } from "rxjs/operators";
import { combineLatest, filter } from "rxjs";
import { Model } from "./Model";
import { Alternative, Cost } from "../blcc-format/Format";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { arrayFilter } from "../util/Operators";
import { bind } from "@react-rxjs/core";

/**
 * The ID of the currently selected alternative as denoted in the URL.
 */
export const alternativeID$ = urlParameters$.pipe(map(({ alternativeID }) => (alternativeID ? +alternativeID : -1)));

/**
 * The current alternative object that relates to the currently selected ID.
 */
export const alt$ = combineLatest([alternativeID$, Model.alternatives$]).pipe(
    map(([altID, alts]) => alts.get(altID)),
    filter((alt): alt is Alternative => alt !== undefined)
);

/**
 * The list of costs associated with the current alternative.
 */
export const altCosts$ = alt$.pipe(
    withLatestFrom(Model.costs$),
    map(([alt, costs]) => alt.costs.map((cost) => costs.get(cost) as Cost))
);

export const [useAltName] = bind(alt$.pipe(map((alt) => alt.name)), "");

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