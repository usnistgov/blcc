import dropdown from "../../../components/Dropdown";
import { LiquidUnit } from "../../../blcc-format/Format";

const { component: UnitDropdown } = dropdown(Object.values(LiquidUnit));

export default function WaterCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <UnitDropdown label={"Unit"} />
            </div>
        </div>
    );
}
