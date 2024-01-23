import { urlParameters$ } from "../components/UrlParameters";
import { combineLatestWith } from "rxjs/operators";
import { combinedCostObject$ } from "../pages/editor/AlternativeSummary";
import { filter, map } from "rxjs";
import { Cost as CostType } from "../blcc-format/Format";
import { shareLatest } from "@react-rxjs/core";

/**
 * The currently selected cost object as specified by the URL parameter.
 */
export const cost$ = urlParameters$.pipe(
    combineLatestWith(combinedCostObject$),
    map(([{ costID }, costs]) => costs.get(parseInt(costID ?? "-1"))),
    filter((cost): cost is CostType => cost !== undefined),
    shareLatest()
);

/**
 * The type of the currently selected cost.
 */
export const costType$ = cost$.pipe(map((cost) => cost.type));
