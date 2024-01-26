import { Typography } from "antd";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import switchComp from "../../../components/Switch";
import numberInput from "../../../components/InputNumber";

const { Title } = Typography;

const [recurring$, setRecurring] = createSignal<boolean>();
const [useRecurring] = bind(recurring$, false);

const { component: InitialCost } = numberInput();
const { component: InitialOccurrence } = numberInput();
const { component: RateOfChange } = numberInput();
const { component: RecurrenceSwitch, onChange$: recurringChange$ } = switchComp(recurring$);
const { component: RateOfRecurrenceInput } = numberInput();

export default function RecurringContractCostFields() {
    const recurring = useRecurring();
    recurringChange$.subscribe(setRecurring);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <InitialCost className={"w-full"} label={"Initial Cost"} addonBefore={"$"} />
                <InitialOccurrence className={"w-full"} label={"Initial Occurrence"} addonBefore={"year"} />
                <RateOfChange className={"w-full"} label={"Rate of Change"} addonAfter={"%"} />
                <div className={"flex flex-col"}>
                    <Title level={5}>Recurring</Title>
                    <span>
                        <RecurrenceSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                    </span>
                    {recurring && <RateOfRecurrenceInput className={"my-4"} addonAfter={"years"} />}
                </div>
            </div>{" "}
        </div>
    );
}
