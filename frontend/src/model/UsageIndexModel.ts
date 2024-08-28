import { createSignal } from "@react-rxjs/utils";
import type { UseIndex } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { type Observable, combineLatest, distinctUntilChanged, map, merge } from "rxjs";
import { filter, shareReplay } from "rxjs/operators";

export namespace UsageIndexModel {
    /**
     * Outputs a value if the current cost is an energy cost
     */
    // @ts-ignore
    const cost$: Observable<UseIndex> = CostModel.cost$.pipe(
        // @ts-ignore
        filter((cost): cost is UseIndex => Object.hasOwn(cost, "useIndex")),
    );

    /**
     * Use index streams
     */
    export const [useIndexChange$, useIndexChange] = createSignal<number | number[]>();
    const newUseIndex$ = useIndexChange$.pipe(shareReplay(1));
    export const useIndex$ = merge(newUseIndex$, cost$.pipe(map((cost) => cost.useIndex))).pipe(
        distinctUntilChanged(),
        shareReplay(1),
    );
    combineLatest([newUseIndex$, CostModel.collection$]).subscribe(([newRates, costCollection]) =>
        costCollection.modify({ useIndex: newRates }),
    );

    useIndex$.subscribe((x) => console.log("Use Index", x));
}
