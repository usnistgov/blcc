import numberInput from "../../../components/InputNumber";
import switchComp from "../../../components/Switch";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { Typography } from "antd";

const { Title } = Typography;

const [recurring$, setRecurring] = createSignal<boolean>();
const [useRecurring] = bind(recurring$, false);

const { component: InitialCostInput } = numberInput();
const { component: InitialOccurrenceInput } = numberInput();
const { component: AnnualRateOfChangeInput } = numberInput();
const { component: RecurrenceSwitch, onChange$: recurringChange$ } = switchComp(recurring$);
const { component: RateOfRecurrenceInput } = numberInput();

export default function OMRCostFields() {
    const recurring = useRecurring();
    recurringChange$.subscribe(setRecurring);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <InitialCostInput className={"w-full"} label={"Initial Cost"} addonBefore={"$"} controls />
                <InitialOccurrenceInput
                    className={"w-full"}
                    label={"Initial Occurrence"}
                    addonAfter={"years"}
                    controls
                />
                <AnnualRateOfChangeInput
                    className={"w-full"}
                    label={"Annual Rate Of Change"}
                    addonAfter={"%"}
                    controls
                />
                <div className={"flex flex-col"}>
                    <Title level={5}>Recurring</Title>
                    <span>
                        <RecurrenceSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                    </span>
                    {recurring && <RateOfRecurrenceInput className={"my-4"} addonAfter={"years"} />}
                </div>
            </div>
        </div>
    );
}
