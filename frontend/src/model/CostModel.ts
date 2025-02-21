import { bind, shareLatest, state } from "@react-rxjs/core";
import { type Cost, CostTypes, type ID, type Project } from "blcc-format/Format";
import { liveQuery } from "dexie";
import { db } from "model/db";
import * as O from "optics-ts";
import { Subject, distinctUntilChanged, map, merge, switchMap } from "rxjs";
import { shareReplay, tap, withLatestFrom } from "rxjs/operators";
import { DexieOps, defaultValue, guard, toggle } from "util/Operators";
import { DexieModel, ModelType, Var } from "util/var";

export namespace CostModel {
    /**
     * The ID of the currently selected cost
     */
    export const sId$ = new Subject<number>();
    export const id$ = sId$.pipe(shareLatest());

    export const collection$ = id$.pipe(distinctUntilChanged(), DexieOps.byId(db.costs), shareReplay(1));

    export const cost = new DexieModel(collection$.pipe(DexieOps.first(), guard()));
    // Write changes back to database
    cost.$.pipe(withLatestFrom(collection$)).subscribe(([next, collection]) => {
        console.log("Modifying cost", next);
        collection.modify(next);
    });

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
