import { bind } from "@react-rxjs/core";
import { liveQuery } from "dexie";
import { Subject, distinctUntilChanged, map, switchMap } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { CostTypes } from "../blcc-format/Format";
import { guard } from "../util/Operators";
import { db } from "./db";

/**
 * The ID of the currently selected cost
 */
export const costID$ = new Subject<number>();

export const costCollection$ = costID$.pipe(
    distinctUntilChanged(),
    map((id) => db.costs.where("id").equals(id)),
    shareReplay(1),
);

export const [useCostID] = bind(costID$, -1);

/**
 * The currently selected cost object as specified by the URL parameter.
 */
export const cost$ = costID$.pipe(
    distinctUntilChanged(),
    switchMap((id) => liveQuery(() => db.costs.where("id").equals(id).first())),
    guard(),
    shareReplay(1),
);

cost$.subscribe((x) => console.log("Cost", x));

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
