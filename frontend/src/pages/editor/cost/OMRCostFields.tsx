import numberInput from "../../../components/InputNumber";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { filter, Observable } from "rxjs";
import { Collection } from "dexie";
import { CostTypes, OMRCost } from "../../../blcc-format/Format";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { map } from "rxjs/operators";
import Recurring from "../../../components/Recurring";

// If we are on this page that means the cost collection can be narrowed to OMRCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<OMRCost, number>>;
const omrCost$ = cost$.pipe(filter((cost): cost is OMRCost => cost.type === CostTypes.OMR));

const { component: InitialCostInput, onChange$: initialCost$ } = numberInput(
    omrCost$.pipe(map((cost) => cost.initialCost))
);
const { component: InitialOccurrenceInput, onChange$: initialOccurrence$ } = numberInput(
    omrCost$.pipe(map((cost) => cost.initialOccurrence))
);
export default function OMRCostFields() {
    useDbUpdate(initialCost$, costCollection$, "initialCost");
    useDbUpdate(initialOccurrence$, costCollection$, "initialOccurrence");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <InitialCostInput className={"w-full"} label={"Initial Cost"} addonBefore={"$"} controls />
                <InitialOccurrenceInput
                    className={"w-full"}
                    label={"Initial Occurrence"}
                    addonAfter={"years"}
                    controls
                />
                <Recurring />
            </div>
        </div>
    );
}
