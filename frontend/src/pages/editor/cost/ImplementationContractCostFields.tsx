import { CostTypes, type ImplementationContractCost } from "blcc-format/Format";
import { NumberInput } from "components/input/InputNumber";
import { Strings } from "constants/Strings";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, merge } from "rxjs";
import { filter, map } from "rxjs/operators";
import cost = CostModel.cost;

/**
 * Component for the implementation contract fields in the cost pages
 */
export default function ImplementationContractCostFields() {
    // Set up streams
    const [sCost$, cost$, sOccurrence$, occurrence$, collection$] = useMemo(() => {
        // If we are on this page that means the cost collection can be narrowed to ImplementationContractCost.
        const collection$ = CostModel.collection$ as Observable<Collection<ImplementationContractCost, number>>;

        const contractCost$ = cost.$.pipe(
            filter((cost): cost is ImplementationContractCost => cost.type === CostTypes.IMPLEMENTATION_CONTRACT),
        );

        const sCost$ = new Subject<number | undefined>();
        const cost$ = merge(sCost$, contractCost$.pipe(map((cost) => cost.cost))).pipe(distinctUntilChanged());

        const sOccurrence$ = new Subject<number | undefined>();
        const occurrence$ = merge(sOccurrence$, contractCost$.pipe(map((cost) => cost.occurrence))).pipe(
            distinctUntilChanged(),
        );

        return [sCost$, cost$, sOccurrence$, occurrence$, collection$];
    }, []);

    useDbUpdate(sCost$, collection$, "cost");
    useDbUpdate(sOccurrence$, collection$, "occurrence");

    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    info={Strings.OCCURRENCE}
                    addonAfter={"years"}
                    label={"Initial occurrence"}
                    subLabel={"(from service date)"}
                    allowEmpty={true}
                    value$={occurrence$}
                    wire={sOccurrence$}
                />
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    label={isSavings ? "Savings" : "Cost"}
                    allowEmpty={true}
                    value$={cost$}
                    wire={sCost$}
                />
            </div>
        </div>
    );
}
