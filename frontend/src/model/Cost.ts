import { urlParameters$ } from "../components/UrlParameters";
import { combineLatestWith } from "rxjs/operators";
import { filter, map } from "rxjs";
import { Cost as CostType } from "../blcc-format/Format";
import { shareLatest } from "@react-rxjs/core";
import { Model } from "./Model";

/**
 * The ID of the currently selected cost
 */
export const costID$ = urlParameters$.pipe(map(({ costID }) => parseInt(costID ?? "-1")));

/**
 * A map of IDs to the corresponding costs
 */
export const costMap$ = Model.costs$.pipe(map((costs) => new Map(costs.map((cost) => [cost.id, cost]))));

/**
 * The currently selected cost object as specified by the URL parameter.
 */
export const cost$ = costID$.pipe(
    combineLatestWith(costMap$),
    map(([costID, costMap]) => costMap.get(costID)),
    filter((cost): cost is CostType => cost !== undefined),
    shareLatest()
);

/**
 * The type of the currently selected cost.
 */
export const costType$ = cost$.pipe(map((cost) => cost.type));
