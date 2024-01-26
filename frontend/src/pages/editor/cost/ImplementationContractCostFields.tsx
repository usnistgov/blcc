import numberInput from "../../../components/InputNumber";

const { component: CostInput } = numberInput();
const { component: OccurrenceInput } = numberInput();

export default function ImplementationContractCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <OccurrenceInput className={"w-full"} label={"Occurrence"} addonBefore={"year"} />
                <CostInput className={"w-full"} label={"Cost"} addonBefore={"$"} />
            </div>
        </div>
    );
}
