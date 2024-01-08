import { filter, map } from "rxjs";
import { CostTypes, CustomerSector, EnergyCost, EnergyUnit, FuelType } from "../../../blcc-format/Format";
import dropdown from "../../../components/Dropdown";
import numberInput from "../../../components/InputNumber";
import { cost$ } from "../../../model/Cost";
import { phaseIn } from "../../../components/PhaseIn";

const energyCost$ = cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));
const usageIndex$ = energyCost$.pipe(map((cost) => cost.useIndex));

const { component: FuelTypeDropdown } = dropdown(
    Object.values(FuelType),
    energyCost$.pipe(map((cost) => cost.fuelType))
);
const { component: CustomerSectorDropdown } = dropdown(
    Object.values(CustomerSector),
    energyCost$.pipe(map((cost) => cost.customerSector))
);
const { component: CostPerUnitInput } = numberInput();
const { component: AnnualConsumption } = numberInput();
const { component: UnitDropdown } = dropdown(Object.values(EnergyUnit));
const { component: PhaseIn } = phaseIn();
const { component: UseIndex } = phaseIn();

export default function EnergyCostFields() {
    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-row"}>
                <FuelTypeDropdown label={"Fuel Type"} />
                <CustomerSectorDropdown label={"Customer Sector"} />
            </div>
            <div className={"flex flex-row"}>
                <CostPerUnitInput label={"Cost per Unit"} controls before={"$"} />
                <AnnualConsumption label={"Annual Consumption"} controls />
            </div>
            <div>
                <UnitDropdown label={"Unit"} />
            </div>
            <div className={"flex flex-row"}>
                <PhaseIn />
                <UseIndex />
            </div>
        </div>
    );
}
