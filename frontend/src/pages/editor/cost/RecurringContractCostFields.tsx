import type { Collection } from "dexie";
import { type Observable, map } from "rxjs";
import { filter } from "rxjs/operators";
import { CostTypes, type RecurringContractCost } from "../../../blcc-format/Format";
import numberInput from "../../../components/InputNumber";
import Recurring from "../../../components/Recurring";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { CostModel } from "../../../model/CostModel";

// If we are on this page that means the cost collection can be narrowed to RecurringContractCost.
const costCollection$ = CostModel.collection$ as Observable<Collection<RecurringContractCost, number>>;
const contractCost$ = CostModel.cost$.pipe(
    filter((cost): cost is RecurringContractCost => cost.type === CostTypes.RECURRING_CONTRACT),
);

const { component: InitialCost, onChange$: initialCost$ } = numberInput(
    "Initial Cost",
    "/",
    contractCost$.pipe(map((cost) => cost.initialCost)),
);
const { component: InitialOccurrence, onChange$: initialOccurrence$ } = numberInput(
    "Initial Occurrence",
    "/",
    contractCost$.pipe(map((cost) => cost.initialOccurrence)),
);
const { component: RateOfChange, onChange$: rateOfChange$ } = numberInput(
    "Rate of Change",
    "/",
    contractCost$.pipe(map((cost) => cost.annualRateOfChange)),
);

export default function RecurringContractCostFields() {
    useDbUpdate(initialCost$, costCollection$, "initialCost");
    useDbUpdate(initialOccurrence$, costCollection$, "initialOccurrence");
    useDbUpdate(rateOfChange$, costCollection$, "annualRateOfChange");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <InitialCost className={"w-full"} addonBefore={"$"} />
                <InitialOccurrence className={"w-full"} addonBefore={"year"} />
                <RateOfChange className={"w-full"} addonAfter={"%"} />
                <Recurring />
            </div>
        </div>
    );
}
