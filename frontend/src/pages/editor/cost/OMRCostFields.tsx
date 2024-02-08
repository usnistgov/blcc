import numberInput from "../../../components/InputNumber";
import switchComp from "../../../components/Switch";
import { bind } from "@react-rxjs/core";
import { Typography } from "antd";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { filter, merge, Observable } from "rxjs";
import { Collection } from "dexie";
import { CostTypes, OMRCost } from "../../../blcc-format/Format";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { map } from "rxjs/operators";

const { Title } = Typography;

// If we are on this page that means the cost collection can be narrowed to OMRCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<OMRCost, number>>;
const omrCost$ = cost$.pipe(filter((cost): cost is OMRCost => cost.type === CostTypes.OMR));

const [useRecurring, recurring$] = bind(omrCost$.pipe(map((cost) => cost.rateOfRecurrence !== undefined)), false);

const { component: InitialCostInput, onChange$: initialCost$ } = numberInput(
    omrCost$.pipe(map((cost) => cost.initialCost))
);
const { component: InitialOccurrenceInput, onChange$: initialOccurrence$ } = numberInput(
    omrCost$.pipe(map((cost) => cost.initialOccurrence))
);
const { component: RecurrenceSwitch, onChange$: recurringChange$ } = switchComp(recurring$);
const { component: RateOfRecurrenceInput, onChange$: rateOfRecurrence$ } = numberInput(
    omrCost$.pipe(map((cost) => cost.rateOfRecurrence)),
    true
);

export default function OMRCostFields() {
    useDbUpdate(initialCost$, costCollection$, "initialCost");
    useDbUpdate(initialOccurrence$, costCollection$, "initialOccurrence");
    useDbUpdate(
        merge(rateOfRecurrence$, recurringChange$.pipe(map((value) => (value ? 0 : undefined)))),
        costCollection$,
        "rateOfRecurrence"
    );

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
                <div className={"flex flex-col"}>
                    <Title level={5}>Recurring</Title>
                    <span>
                        <RecurrenceSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                    </span>
                    {useRecurring() && <RateOfRecurrenceInput className={"my-4"} addonAfter={"years"} />}
                </div>
            </div>
        </div>
    );
}
