import dropdown from "../../../components/Dropdown";
import { LiquidUnit } from "../../../blcc-format/Format";

const { component: UnitDropdown } = dropdown(Object.values(LiquidUnit));

export default function WaterCostFields() {
    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-row"}>
                <UnitDropdown label={"Unit"} />
            </div>
        </div>
    );
}
