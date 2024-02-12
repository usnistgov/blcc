import numberInput from "../../../components/InputNumber";
import Recurring from "../../../components/Recurring";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { map, Observable } from "rxjs";
import { Collection } from "dexie";
import { CostTypes, RecurringContractCost } from "../../../blcc-format/Format";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { filter } from "rxjs/operators";

// If we are on this page that means the cost collection can be narrowed to RecurringContractCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<RecurringContractCost, number>>;
const contractCost$ = cost$.pipe(
    filter((cost): cost is RecurringContractCost => cost.type === CostTypes.RECURRING_CONTRACT)
);

const { component: InitialCost, onChange$: initialCost$ } = numberInput(
    contractCost$.pipe(map((cost) => cost.initialCost))
);
const { component: InitialOccurrence, onChange$: initialOccurrence$ } = numberInput(
    contractCost$.pipe(map((cost) => cost.initialOccurrence))
);
const { component: RateOfChange, onChange$: rateOfChange$ } = numberInput(
    contractCost$.pipe(map((cost) => cost.annualRateOfChange))
);

export default function RecurringContractCostFields() {
    useDbUpdate(initialCost$, costCollection$, "initialCost");
    useDbUpdate(initialOccurrence$, costCollection$, "initialOccurrence");
    useDbUpdate(rateOfChange$, costCollection$, "annualRateOfChange");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <InitialCost className={"w-full"} label={"Initial Cost"} addonBefore={"$"} />
                <InitialOccurrence className={"w-full"} label={"Initial Occurrence"} addonBefore={"year"} />
                <RateOfChange className={"w-full"} label={"Rate of Change"} addonAfter={"%"} />
                <Recurring />
            </div>
        </div>
    );
}
