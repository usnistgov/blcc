import { CostTypes, type RecurringContractCost } from "blcc-format/Format";
import Recurring from "components/Recurring";
import { NumberInput } from "components/input/InputNumber";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, map, merge } from "rxjs";
import { filter } from "rxjs/operators";

export default function RecurringContractCostFields() {
    const [
        sInitialCost$,
        initialCost$,
        sInitialOccurrence$,
        initialOccurrence$,
        sRateOfChange$,
        rateOfChange$,
        collection$,
    ] = useMemo(() => {
        // If we are on this page that means the cost collection can be narrowed to RecurringContractCost.
        const collection$ = CostModel.collection$ as Observable<Collection<RecurringContractCost, number>>;
        const contractCost$ = CostModel.cost$.pipe(
            filter((cost): cost is RecurringContractCost => cost.type === CostTypes.RECURRING_CONTRACT),
        );

        const sInitialCost$ = new Subject<number>();
        const initialCost$ = merge(sInitialCost$, contractCost$.pipe(map((cost) => cost.initialCost))).pipe(
            distinctUntilChanged(),
        );

        const sInitialOccurrence$ = new Subject<number>();
        const initialOccurrence$ = merge(
            sInitialOccurrence$,
            contractCost$.pipe(map((cost) => cost.initialOccurrence)),
        ).pipe(distinctUntilChanged());

        const sRateOfChange$ = new Subject<number>();
        const rateOfChange$ = merge(sRateOfChange$, contractCost$.pipe(map((cost) => cost.annualRateOfChange))).pipe(
            distinctUntilChanged(),
        );

        return [
            sInitialCost$,
            initialCost$,
            sInitialOccurrence$,
            initialOccurrence$,
            sRateOfChange$,
            rateOfChange$,
            collection$,
        ];
    }, []);

    // Set up subscriptions to write changes to IndexedDB
    useDbUpdate(sInitialCost$, collection$, "initialCost");
    useDbUpdate(sInitialOccurrence$, collection$, "initialOccurrence");
    useDbUpdate(sRateOfChange$, collection$, "annualRateOfChange");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    label={"Initial Cost"}
                    wire={sInitialCost$}
                    value$={initialCost$}
                />
                <NumberInput
                    className={"w-full"}
                    addonBefore={"year"}
                    label={"Initial Occurrence"}
                    wire={sInitialOccurrence$}
                    value$={initialOccurrence$}
                />
                <NumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    label={"Rate of Change"}
                    wire={sRateOfChange$}
                    value$={rateOfChange$}
                />
                <Recurring />
            </div>
        </div>
    );
}
