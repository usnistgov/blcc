import { CostTypes, type OMRCost } from "blcc-format/Format";
import Recurring from "components/Recurring";
import { NumberInput } from "components/input/InputNumber";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, filter, merge } from "rxjs";
import { map } from "rxjs/operators";
import cost = CostModel.cost;
import { Strings } from "../../../constants/Strings";

/**
 * Component for the OMR fields for a cost
 */
export default function OMRCostFields() {
    const [sInitialCost$, initialCost$, sInitialOccurrence$, initialOccurrence$, collection$] = useMemo(() => {
        // If we are on this page that means the cost collection can be narrowed to OMRCost.
        const collection$ = CostModel.collection$ as Observable<Collection<OMRCost, number>>;
        const omrCost$ = cost.$.pipe(filter((cost): cost is OMRCost => cost.type === CostTypes.OMR));

        const sInitialCost$ = new Subject<number>();
        const initialCost$ = merge(sInitialCost$, omrCost$.pipe(map((cost) => cost.initialCost))).pipe(
            distinctUntilChanged(),
        );

        const sInitialOccurrence$ = new Subject<number>();
        const initialOccurrence$ = merge(
            sInitialOccurrence$,
            omrCost$.pipe(map((cost) => cost.initialOccurrence)),
        ).pipe(distinctUntilChanged());

        return [sInitialCost$, initialCost$, sInitialOccurrence$, initialOccurrence$, collection$];
    }, []);

    // Set up subscriptions to write change to IndexedDB
    useDbUpdate(sInitialCost$, collection$, "initialCost");
    useDbUpdate(sInitialOccurrence$, collection$, "initialOccurrence");

    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    controls
                    id={"initial-cost"}
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    value$={initialCost$}
                    wire={sInitialCost$}
                    info={Strings.INITIAL_COST_INFO}
                />
                <NumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    value$={initialOccurrence$}
                    wire={sInitialOccurrence$}
                    info={Strings.INITIAL_OCCURRENCE_AFTER_SERVICE}
                />
            </div>
            <Recurring showUnit={false} />
        </div>
    );
}
