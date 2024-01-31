import { urlParameters$ } from "../components/UrlParameters";
import { combineLatestWith } from "rxjs/operators";
import { filter, map } from "rxjs";
import { Cost as CostType } from "../blcc-format/Format";
import { bind, shareLatest } from "@react-rxjs/core";
import { Model } from "./Model";

/**
 * The ID of the currently selected cost
 */
export const costID$ = urlParameters$.pipe(map(({ costID }) => parseInt(costID ?? "-1")));
export const [useCostID] = bind(costID$, -1);

/**
 * The currently selected cost object as specified by the URL parameter.
 */
export const cost$ = costID$.pipe(
    combineLatestWith(Model.costs$),
    map(([costID, costs]) => costs.get(costID)),
    filter((cost): cost is CostType => cost !== undefined),
    shareLatest()
);

/**
 * The type of the currently selected cost.
 */
export const costType$ = cost$.pipe(map((cost) => cost.type));
