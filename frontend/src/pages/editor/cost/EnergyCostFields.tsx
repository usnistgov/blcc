import { filter, map } from "rxjs";
import { CostTypes, CustomerSector, EnergyCost, FuelType } from "../../../blcc-format/Format";
import dropdown from "../../../components/Dropdown";
import numberInput from "../../../components/InputNumber";
import { cost$ } from "../Cost";

const energyCost$ = cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

const { component: FuelTypeDropdown } = dropdown(
    Object.values(FuelType),
    energyCost$.pipe(map((cost) => cost.fuelType))
);
const { component: CustomerSectorDropdown } = dropdown(
    Object.values(CustomerSector),
    energyCost$.pipe(map((cost) => cost.customerSector))
);
const { component: CostPerUnitInput } = numberInput();

export default function EnergyCostFields() {
    return (
        <div className={""}>
            <FuelTypeDropdown label={"Fuel Type"} />
            <CustomerSectorDropdown label={"Customer Sector"} />
            <CostPerUnitInput label={"Cost per Unit"} controls before={"$"} />
        </div>
    );
}
