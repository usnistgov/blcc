import { Subject } from "rxjs";
import { LiquidUnit } from "../../../blcc-format/Format";
import { Dropdown } from "../../../components/Dropdown";

export default function WaterCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <Dropdown label={"Unit"} options={Object.values(LiquidUnit)} wire={new Subject<LiquidUnit>()} />
                {/*TODO ability to have multiple seasons up to 4*/}
            </div>
        </div>
    );
}
