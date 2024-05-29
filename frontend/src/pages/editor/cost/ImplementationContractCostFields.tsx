import type { Collection } from "dexie";
import type { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { CostTypes, type ImplementationContractCost } from "../../../blcc-format/Format";
import numberInput from "../../../components/InputNumber";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { CostModel } from "../../../model/CostModel";

// If we are on this page that means the cost collection can be narrowed to ImplementationContractCost.
const costCollection$ = CostModel.collection$ as Observable<Collection<ImplementationContractCost, number>>;
const contractCost$ = CostModel.cost$.pipe(
    filter((cost): cost is ImplementationContractCost => cost.type === CostTypes.IMPLEMENTATION_CONTRACT),
);

const { component: CostInput, onChange$: costInput$ } = numberInput(
    "Cost",
    "/",
    contractCost$.pipe(map((cost) => cost.cost)),
);
const { component: OccurrenceInput, onChange$: occurrence$ } = numberInput(
    "Occurrence",
    "/",
    contractCost$.pipe(map((cost) => cost.occurrence)),
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
