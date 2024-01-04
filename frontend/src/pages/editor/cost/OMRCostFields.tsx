import numberInput from "../../../components/InputNumber";
import switchComp from "../../../components/Switch";

const { component: InitialCostInput } = numberInput();
const { component: InitialOccurrenceInput } = numberInput();
const { component: AnnualRateOfChangeInput } = numberInput();
const { component: RecurrenceSwitch } = switchComp();

export default function OMRCostFields() {
    return (
        <div className={"flex flex-col"}>
            <InitialCostInput label={"Initial Cost"} before={"$"} controls />
            <InitialOccurrenceInput label={"Initial Occurrence"} after={"years"} controls />
            <AnnualRateOfChangeInput label={"Annual Rate Of Change"} after={"%"} controls />
            <div>
                <RecurrenceSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
            </div>
        </div>
    );
}
