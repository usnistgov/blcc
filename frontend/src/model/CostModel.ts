import { shareLatest } from "@react-rxjs/core";
import type { Cost, ID } from "blcc-format/Format";
import { db } from "model/db";
import * as O from "optics-ts";
import { Subject } from "rxjs";
import { shareReplay, withLatestFrom } from "rxjs/operators";
import { DexieOps, guard, toggle } from "util/Operators";
import { DexieModel, Var } from "util/var";

export namespace CostModel {
    /**
     * The ID of the currently selected cost
     */
    export const sId$ = new Subject<number>();
    export const id$ = sId$.pipe(shareLatest());

    export const collection$ = id$.pipe(DexieOps.byId(db.costs), shareReplay(1));

    export const cost = new DexieModel(collection$.pipe(DexieOps.first(), guard()), collection$);

    export const id = new Var(cost, O.optic<Cost>().prop("id"));

    /**
     * The type of the currently selected cost.
     */
    export const type = new Var(cost, O.optic<Cost>().prop("type"));

    /**
     * Whether this cost is a cost or a savings.
     */
    export const costOrSavings = new Var(cost, O.optic<Cost>().prop("costSavings"));

    /**
     * The name of the current cost
     */
    export const name = new Var(cost, O.optic<Cost>().prop("name"));

    /**
     * The description of the current cost
     */
    export const description = new Var(cost, O.optic<Cost>().prop("description"));

    export const sToggleAlt$ = new Subject<ID>();
    sToggleAlt$.pipe(withLatestFrom(id$)).subscribe(([altID, id]) => {
        db.alternatives
            .where("id")
            .equals(altID)
            .modify((alt) => {
                alt.costs = [...toggle(new Set(alt.costs), id)];
            });
    });

    export namespace Actions {
        export function load(id: ID) {
            sId$.next(id);
        }
    }
}
