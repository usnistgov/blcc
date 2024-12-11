import { bind, shareLatest, state } from "@react-rxjs/core";
import { type Cost, CostTypes, type ID, type Project } from "blcc-format/Format";
import { liveQuery } from "dexie";
import { DexieModel, ModelType, Var } from "model/Model";
import { db } from "model/db";
import * as O from "optics-ts";
import { Subject, distinctUntilChanged, map, merge, switchMap } from "rxjs";
import { shareReplay, tap, withLatestFrom } from "rxjs/operators";
import { DexieOps, defaultValue, guard, toggle } from "util/Operators";

export namespace CostModel {
    /**
     * The ID of the currently selected cost
     */
    export const sId$ = new Subject<number>();
    export const id$ = sId$.pipe(shareLatest());

    export const collection$ = id$.pipe(distinctUntilChanged(), DexieOps.byId(db.costs), shareReplay(1));

    export const DexieCostModel = new DexieModel(collection$.pipe(DexieOps.first(), guard()));

    /**
     * The currently selected cost object as specified by the URL parameter.
     */
    export const cost$ = id$.pipe(
        distinctUntilChanged(),
        switchMap((id) => liveQuery(() => db.costs.where("id").equals(id).first())),
        guard(),
        shareReplay(1),
    );

    /**
     * The type of the currently selected cost.
     */
    export const type$ = cost$.pipe(map((cost) => cost.type));
    export const [useType] = bind(type$, CostTypes.OTHER);

    /**
     * Whether this cost is a cost or a savings.
     */
    export const costOrSavings$ = cost$.pipe(map((cost) => cost.costSavings ?? false));
    export const [useCostOrSavings] = bind(costOrSavings$, false);

    /**
     * The name of the current cost
     */
    export const name = new Var(DexieCostModel, O.optic<Cost>().prop("name"));

    /**
     * The description of the current cost
     */
    export const sDescription$ = new Subject<string | undefined>();
    export const description$ = state(
        merge(sDescription$, cost$.pipe(map((cost) => cost?.description))).pipe(distinctUntilChanged()),
        undefined,
    );
    sDescription$
        .pipe(withLatestFrom(collection$))
        .subscribe(([description, collection]) => collection.modify({ description }));

    export const sToggleAlt$ = new Subject<ID>();
    sToggleAlt$.pipe(withLatestFrom(id$)).subscribe(([altID, id]) => {
        db.alternatives
            .where("id")
            .equals(altID)
            .modify((alt) => {
                alt.costs = [...toggle(new Set(alt.costs), id)];
            });
    });
    //export const [sDescription$, description$] = costModelState((cost) => cost?.description, "description");

    /**
     * The cost/savings value for this cost
     */
    export const sCostSavings$ = new Subject<boolean>();
    export const costSavings$ = state(
        merge(sCostSavings$, cost$.pipe(map((cost) => cost?.costSavings ?? false))).pipe(distinctUntilChanged()),
        false,
    );
    sCostSavings$
        .pipe(withLatestFrom(collection$))
        .subscribe(([costSavings, collection]) => collection.modify({ costSavings }));
}

/*function createModelState<A, B, Default = undefined>(
    input$: Observable<B>,
    collection$: Observable<Collection<A>>,
    key: keyof A,
    init: Default = undefined
): [Subject<B>, StateObservable<B | Default>] {
    const subject$ = new Subject<B>();
    const stream$ = state(merge(subject$, input$).pipe(distinctUntilChanged()), init);
    subject$.pipe(withLatestFrom(collection$)).subscribe(([value, collection]) => collection.modify({ [key]: value }));

    return [subject$, stream$];
}*/
