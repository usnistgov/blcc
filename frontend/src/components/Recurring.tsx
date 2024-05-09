import { Typography } from "antd";
import switchComp from "./Switch";
import numberInput from "./InputNumber";
import { filter, map } from "rxjs/operators";
import { cost$, costCollection$ as baseCostCollection$ } from "../model/CostModel";
import { CostTypes, type OMRCost, type RecurringContractCost } from "../blcc-format/Format";
import { merge, type Observable } from "rxjs";
import type { Collection } from "dexie";
import { bind } from "@react-rxjs/core";
import { useDbUpdate } from "../hooks/UseDbUpdate";

const { Title } = Typography;

// If we are on this page that means the cost collection can be narrowed to OMRCost | RecurringContractCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<OMRCost | RecurringContractCost, number>>;
const recurringCost$ = cost$.pipe(
    filter(
        (cost): cost is OMRCost | RecurringContractCost =>
            cost.type === CostTypes.OMR || cost.type === CostTypes.RECURRING_CONTRACT
    )
);

const [useRecurring, recurring$] = bind(recurringCost$.pipe(map((cost) => cost.rateOfRecurrence !== undefined)), false);

/*const { component: RecurrenceSwitch, onChange$: recurringChange$ } = switchComp(recurring$);*/
const { component: RateOfRecurrenceInput, onChange$: rateOfRecurrence$ } = numberInput(
    "Recurring",
    `${window.location.pathname}#Recurring`,
    recurringCost$.pipe(map((cost) => cost.rateOfRecurrence)),
    true
);

export default function Recurring() {
/*    useDbUpdate(
        merge(rateOfRecurrence$, recurringChange$.pipe(map((value) => (value ? 0 : undefined)))),
        costCollection$,
        "rateOfRecurrence"
    );*/

    return (
        <div className={"flex flex-col"}>
            <Title level={5}>Recurring</Title>
            <span>
                {/*<RecurrenceSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />*/}
            </span>
            {useRecurring() && <RateOfRecurrenceInput className={"my-4"} label={false} addonAfter={"years"} />}
        </div>
    );
}
