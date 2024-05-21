import type { Collection } from "dexie";
import { type Observable, filter } from "rxjs";
import { map } from "rxjs/operators";
import { CostTypes, type OMRCost } from "../../../blcc-format/Format";
import numberInput from "../../../components/InputNumber";
import Recurring from "../../../components/Recurring";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { CostModel } from "../../../model/CostModel";

// If we are on this page that means the cost collection can be narrowed to OMRCost.
const costCollection$ = CostModel.collection$ as Observable<Collection<OMRCost, number>>;
const omrCost$ = CostModel.cost$.pipe(filter((cost): cost is OMRCost => cost.type === CostTypes.OMR));

const { component: InitialCostInput, onChange$: initialCost$ } = numberInput(
    "Initial Cost",
    "/",
    omrCost$.pipe(map((cost) => cost.initialCost)),
);
const { component: InitialOccurrenceInput, onChange$: initialOccurrence$ } = numberInput(
    "Initial Occurrence",
    "/",
    omrCost$.pipe(map((cost) => cost.initialOccurrence)),
);
export default function OMRCostFields() {
    useDbUpdate(initialCost$, costCollection$, "initialCost");
    useDbUpdate(initialOccurrence$, costCollection$, "initialOccurrence");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <InitialCostInput className={"w-full"} addonBefore={"$"} controls />
                <InitialOccurrenceInput className={"w-full"} addonAfter={"years"} controls />
                <Recurring />
            </div>
        </div>
    );
}
