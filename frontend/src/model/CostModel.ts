import { bind, shareLatest, state } from "@react-rxjs/core";
import { CostTypes, type ID } from "blcc-format/Format";
import { liveQuery } from "dexie";
import { db } from "model/db";
import { Subject, distinctUntilChanged, map, merge, switchMap } from "rxjs";
import { shareReplay, withLatestFrom } from "rxjs/operators";
import { defaultValue, guard, toggle } from "util/Operators";
import { AlternativeModel } from "./AlternativeModel";

export namespace CostModel {
    /**
     * The ID of the currently selected cost
     */
    export const sId$ = new Subject<number>();
    export const id$ = sId$.pipe(shareLatest());

    export const collection$ = id$.pipe(
        distinctUntilChanged(),
        map((id) => db.costs.where("id").equals(id)),
        shareReplay(1),
    );

    export const [useID] = bind(id$, -1);

    /*function costModelState<B>(mapper: (cost: Cost) => B, key: keyof Cost) {
        return createModelState(cost$.pipe(map((cost) => mapper(cost))), collection$, key);
    }*/

    /**
     * The currently selected cost object as specified by the URL parameter.
     */
    export const cost$ = id$.pipe(
        distinctUntilChanged(),
        switchMap((id) => liveQuery(() => db.costs.where("id").equals(id).first())),
        guard(),
        shareReplay(1),
    );

    cost$.subscribe((x) => console.log("Cost", x));

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
    export const sName$ = new Subject<string | undefined>();
    const newName$ = sName$.pipe(defaultValue("Unnamed Cost"));
    export const name$ = state(
        merge(newName$, cost$.pipe(map((cost) => cost?.name))).pipe(distinctUntilChanged()),
        undefined,
    );
    newName$.pipe(withLatestFrom(collection$)).subscribe(([name, collection]) => collection.modify({ name }));

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
        console.log("Toggle cost", altID, id);

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
