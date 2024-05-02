import { urlParameters$ } from "../components/UrlParameters";
import { Subject, map, switchMap } from "rxjs";
import { bind, shareLatest } from "@react-rxjs/core";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";
import { CostTypes } from "../blcc-format/Format";

/**
 * The ID of the currently selected cost
 */
export const costID$ = new Subject<number>();
/*
export const costID$ = urlParameters$.pipe(
    map(({ costID }) => Number.parseInt(costID ?? "-1")),
    shareLatest()
);
*/

export const costCollection$ = costID$.pipe(map((id) => db.costs.where("id").equals(id)));

export const [useCostID] = bind(costID$, -1);

/**
 * The currently selected cost object as specified by the URL parameter.
 */
export const cost$ = costID$.pipe(
    switchMap((id) => liveQuery(() => db.costs.where("id").equals(id).first())),
    guard(),
    shareLatest()
);

/**
 * The type of the currently selected cost.
 */
export const costType$ = cost$.pipe(map((cost) => cost.type));
export const [useCostType] = bind(costType$, CostTypes.OTHER);

/**
 * Whether this cost is a cost or a savings.
 */
export const costOrSavings$ = cost$.pipe(map((cost) => cost.costSavings ?? false));
export const [useCostOrSavings] = bind(costOrSavings$, false);
