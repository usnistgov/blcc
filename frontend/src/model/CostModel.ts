import { shareLatest } from "@react-rxjs/core";
import type { Cost, ID } from "blcc-format/Format";
import { db } from "model/db";
import * as O from "optics-ts";
import { combineLatest, iif, of, Subject } from "rxjs";
import { sample, shareReplay, switchMap, withLatestFrom } from "rxjs/operators";
import { DexieOps, guard, toggle } from "util/Operators";
import { DexieModel, Var } from "util/var";
import { z } from "zod";
import { confirm } from "util/Operators";
import { CostTypes, type Cost as FormatCost } from "blcc-format/Format";
import { AlternativeModel } from "./AlternativeModel";
import { currentProject$ } from "./Model";
import { cloneName, omit } from "util/Util";

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
    export const name = new Var(cost, O.optic<Cost>().prop("name"), z.string().min(1, { message: "Required" }));

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

        export const cloneClick$ = new Subject<void>();

        export const clone$ = combineLatest([cost.$, currentProject$]).pipe(sample(cloneClick$), switchMap(cloneCost));

        export function deleteCurrent() {
            sRemoveCost$.next(undefined);
        }

        export function deleteByID(id: ID) {
            sRemoveCost$.next(id);
        }

        const sRemoveCost$ = new Subject<ID | undefined>();
        export const removeCost$ = sRemoveCost$.pipe(
            confirm("Delete Cost?", "This action cannot be undone", { okText: "Delete", okType: "danger" }),
            switchMap((value) => iif(() => value === undefined, CostModel.id.$, of(value as number))),
            withLatestFrom(currentProject$),
            switchMap(removeCost),
        );

        function removeCost([costID, projectID]: [number, number]) {
            return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
                // Delete cost
                db.costs.where("id").equals(costID).delete();

                // Remove cost from all associated alternatives
                db.alternatives
                    .filter((alternative) => alternative.costs.includes(costID))
                    .modify((alternative) => {
                        const index = alternative.costs.indexOf(costID);
                        if (index > -1) {
                            alternative.costs.splice(index, 1);
                        }
                    });

                // Remove cost from project
                db.projects
                    .where("id")
                    .equals(projectID)
                    .modify((project) => {
                        const index = project.costs.indexOf(costID);
                        if (index > -1) {
                            project.costs.splice(index, 1);
                        }
                    });
            });
        }

        /**
         * Clones the current cost, gives it a new name, and adds it to the database.
         * @param cost The cost to clone.
         * @param projectID The ID of the project to add the new cloned cost to.
         */
        async function cloneCost([cost, projectID]: [FormatCost, ID]): Promise<ID> {
            return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
                // Omitting the id is necessary so it doesn't try to create an object with duplicate id
                const newCost = { ...omit(cost, "id"), name: cloneName(cost.name) } as FormatCost;

                // Create new clone cost
                const newID = await db.costs.add(newCost);

                // Add to current project
                db.projects
                    .where("id")
                    .equals(projectID)
                    .modify((project) => {
                        project.costs.push(newID);
                    });

                // Add to necessary alternatives
                db.alternatives
                    .filter((alternative) => alternative.costs.includes(cost.id ?? 0))
                    .modify((alternative) => {
                        alternative.costs.push(newID);
                    });

                return newID;
            });
        }
    }
}
