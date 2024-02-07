import { urlParameters$ } from "../components/UrlParameters";
import { map, switchMap } from "rxjs";
import { bind, shareLatest } from "@react-rxjs/core";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";
import { CostTypes } from "../blcc-format/Format";

/**
 * The ID of the currently selected cost
 */
export const costID$ = urlParameters$.pipe(map(({ costID }) => parseInt(costID ?? "-1")));

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
