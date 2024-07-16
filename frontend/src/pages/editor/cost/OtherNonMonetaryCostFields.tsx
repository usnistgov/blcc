import { EMPTY, Subject } from "rxjs";
import Recurring from "../../../components/Recurring";
import { NumberInput } from "../../../components/input/InputNumber";
import TextInput, { TextInputType } from "../../../components/input/TextInput";

export default function OtherNonMonetaryCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NumberInput className={"w-full"} label={"Initial Occurrence"} value$={EMPTY} />
                <TextInput className={"w-full"} label={"Unit Name"} type={TextInputType.PRIMARY} wire={new Subject()} />
                <NumberInput className={"w-full"} label={"Number of Units"} value$={EMPTY} />
                <Recurring />
            </div>
        </div>
    );
}
