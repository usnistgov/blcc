import { bind, state } from "@react-rxjs/core";
import type { Alternative, ID } from "blcc-format/Format";
import { liveQuery } from "dexie";
import { alternatives$, currentProject$ } from "model/Model";
import { db } from "model/db";
import { BehaviorSubject, type Observable, Subject, distinctUntilChanged, iif, merge, of, switchMap } from "rxjs";
import { map, shareReplay, tap, withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { arrayFilter, confirm, defaultValue, guard } from "util/Operators";
import { cloneName, isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "util/Util";

export namespace AlternativeModel {
    /**
     * The ID of the currently selected alternative as denoted in the URL.
     */
    export const sID$ = new BehaviorSubject<number>(0);

    export const [useID, ID$] = bind(sID$, 0);

    export const collection$ = sID$.pipe(map((id) => db.alternatives.where("id").equals(id)));

    /**
     * The current alternative object that relates to the currently selected ID.
     */
    export const alternative$ = sID$.pipe(
        distinctUntilChanged(),
        switchMap((id) => liveQuery(() => db.alternatives.where("id").equals(id).first())),
        guard(),
        shareReplay(1),
    );

    /**
     * The list of costs associated with the current alternative.
     */
    export const altCosts$ = alternative$.pipe(
        switchMap((alt) => liveQuery(() => db.costs.where("id").anyOf(alt.costs).toArray())),
        shareReplay(1),
    );

    /**
     * The energy costs of the current alternative.
     */
    export const energyCosts$ = state(altCosts$.pipe(arrayFilter(isEnergyCost)), []);

    /**
     * The water costs of the current alternative.
     */
    export const waterCosts$ = state(altCosts$.pipe(arrayFilter(isWaterCost)), []);

    /**
     * The capital costs of the current alternative.
     */
    export const capitalCosts$ = state(altCosts$.pipe(arrayFilter(isCapitalCost)), []);

    /**
     * The contract costs of the current alternative.
     */
    export const contractCosts$ = state(altCosts$.pipe(arrayFilter(isContractCost)), []);

    /**
     * The other costs of the current alternative.
     */
    export const otherCosts$ = state(altCosts$.pipe(arrayFilter(isOtherCost)), []);

    export const sName$ = new Subject<string | undefined>();
    const newName$ = sName$.pipe(defaultValue("Unnamed Alternative"));
    export const name$ = state(
        merge(newName$, alternative$.pipe(map((alternative) => alternative?.name))).pipe(distinctUntilChanged()),
        undefined,
    );
    newName$.pipe(withLatestFrom(collection$)).subscribe(([name, collection]) => collection.modify({ name }));

    export const sDescription$ = new Subject<string | undefined>();
    export const description$ = state(
        merge(sDescription$, alternative$.pipe(map((alternative) => alternative?.description))).pipe(
            distinctUntilChanged(),
        ),
    );
    sDescription$
        .pipe(withLatestFrom(collection$))
        .subscribe(([description, collection]) => collection.modify({ description }));

    export const sSetBaseline$ = new Subject<void>();
    export const sBaseline$ = new Subject<boolean>();
    export const sMakeBaseline$ = new Subject<ID>();
    export const isBaseline$ = state(
        merge(sBaseline$, alternative$.pipe(map((alternative) => alternative?.baseline ?? false))).pipe(
            distinctUntilChanged(),
        ),
        false,
    );
    merge(sBaseline$, sSetBaseline$.pipe(map(() => true)))
        .pipe(withLatestFrom(alternative$))
        .subscribe(([baseline, alternative]) => setBaseline(baseline, alternative.id ?? 0));
    sMakeBaseline$.subscribe((id) => setBaseline(true, id));
    export const hasBaseline$ = alternatives$.pipe(map((alts) => alts.find((alt) => alt.baseline) !== undefined));

    export namespace Actions {
        export function deleteCurrent() {
            sRemoveAlternative$.next();
        }

        const sRemoveAlternative$ = new Subject<void>();
        export const removeAlternative$ = sRemoveAlternative$.pipe(
            confirm("Delete Alternative?", "This action cannot be undone", { okText: "Delete", okType: "danger" }),
            withLatestFrom(AlternativeModel.sID$, currentProject$),
            map(([_, id, project]) => [id, project] as [number, number]),
            switchMap(removeAlternative),
        );

        function removeAlternative([alternativeID, projectID]: [number, number]) {
            return db.transaction("rw", db.alternatives, db.projects, async () => {
                // Remove alternative
                db.alternatives.where("id").equals(alternativeID).delete();

                // Remove alternative ID from project
                db.projects
                    .where("id")
                    .equals(projectID)
                    .modify((project) => {
                        const index = project.alternatives.indexOf(alternativeID);
                        if (index > -1) {
                            project.alternatives.splice(index, 1);
                        }
                    });

                //TODO remove costs only associated with this alternative?
            });
        }

        /**
         * Clones the current alternative
         */
        export function cloneCurrent() {
            sCloneAlternative$.next(undefined);
        }

        /**
         * Clones the alternative denoted by the given ID.
         *
         * @param id the ID of the alternative to clone.
         */
        export function clone(id: ID) {
            sCloneAlternative$.next(id);
        }

        // Subject to initiate cloning
        const sCloneAlternative$ = new Subject<ID | undefined>();

        // Stream that returns the ID of the newly created clone.
        export const clonedAlternative$: Observable<number | Alternative> = sCloneAlternative$.pipe(
            switchMap((value) => iif(() => value === undefined, alternative$, of(value as number))),
            withLatestFrom(currentProject$),
            switchMap(cloneAlternative),
        );

        /**
         * Clones the specified alternative.
         *
         * @param alternativeIDOrObj The alternative object or alternative ID to clone.
         * @param projectID The id of the current project to store the clone in.
         * @private
         */
        async function cloneAlternative([alternativeIDOrObj, projectID]: [ID | Alternative, ID]): Promise<ID> {
            // Get the alternative from the db if necessary
            const alternative = await match(alternativeIDOrObj)
                .with(P.number, async (id) => await db.alternatives.where("id").equals(id).first())
                .otherwise(async (obj) => obj);

            if (alternative === undefined) return 0;

            // Clone copies everything besides the baseline value and the name is changed for differentiation
            const newAlternative = {
                ...alternative,
                id: undefined,
                baseline: false,
                name: cloneName(alternative.name),
            } as Alternative;

            return db.transaction("rw", db.alternatives, db.projects, async () => {
                // Add cloned alternative
                const newID = await db.alternatives.add(newAlternative);

                // Add copy to project
                db.projects
                    .where("id")
                    .equals(projectID)
                    .modify((project) => {
                        project.alternatives.push(newID);
                    });

                return newID;
            });
        }
    }
}

function setBaseline(baseline: boolean, id: ID) {
    db.transaction("rw", db.alternatives, async () => {
        db.alternatives.where("id").equals(id).modify({ baseline });

        // If we are setting the current alternatives baseline to true, set all other alternative baselines to false.
        if (baseline) db.alternatives.where("id").notEqual(id).modify({ baseline: false });
    });
}
