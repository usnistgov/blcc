import numberInput from "../../../components/InputNumber";
import type { Observable } from "rxjs";
import type { Collection } from "dexie";
import { CostTypes, type ImplementationContractCost } from "../../../blcc-format/Format";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { filter, map } from "rxjs/operators";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";

// If we are on this page that means the cost collection can be narrowed to ImplementationContractCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<ImplementationContractCost, number>>;
const contractCost$ = cost$.pipe(
    filter((cost): cost is ImplementationContractCost => cost.type === CostTypes.IMPLEMENTATION_CONTRACT)
);

const { component: CostInput, onChange$: costInput$ } = numberInput(
    "Cost",
    "/",
    contractCost$.pipe(map((cost) => cost.cost))
);
const { component: OccurrenceInput, onChange$: occurrence$ } = numberInput(
    "Occurrence",
    "/",
    contractCost$.pipe(map((cost) => cost.occurrence))
);

export default function ImplementationContractCostFields() {
    useDbUpdate(costInput$, costCollection$, "cost");
    useDbUpdate(occurrence$, costCollection$, "occurrence");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <OccurrenceInput className={"w-full"} addonBefore={"year"} />
                <CostInput className={"w-full"} addonBefore={"$"} />
            </div>
        </div>
    );
}
