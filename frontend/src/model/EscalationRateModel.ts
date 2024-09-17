import { createSignal } from "@react-rxjs/utils";
import type { EscalationRate } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { type Observable, combineLatest, distinctUntilChanged, map, merge } from "rxjs";
import { filter, shareReplay } from "rxjs/operators";

export namespace EscalationRateModel {
    /**
     * Outputs a value if the current cost has an escalation rate.
     */
    // @ts-ignore
    const cost$: Observable<EscalationRate> = CostModel.cost$.pipe(
        // @ts-ignore
        filter((cost): cost is EscalationRate => Object.hasOwn(cost, "escalationRate")),
    );

    /**
     * Escalation Rate streams
     */
    export const [useEscalationRate$, escalationChange] = createSignal<number | number[]>();
    const newEscalationRate$ = useEscalationRate$.pipe(shareReplay(1));
    export const escalation$ = merge(newEscalationRate$, cost$.pipe(map((cost) => cost.escalation))).pipe(
        distinctUntilChanged(),
        shareReplay(1),
    );
    combineLatest([newEscalationRate$, CostModel.collection$]).subscribe(([escalation, collection]) =>
        collection.modify({ escalation }),
    );
}
