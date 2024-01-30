import { combineLatest, filter, from, map } from "rxjs";
import { CostTypes, CustomerSector, EnergyCost, EnergyUnit, FuelType } from "../../../blcc-format/Format";
import dropdown from "../../../components/Dropdown";
import numberInput from "../../../components/InputNumber";
import { cost$ } from "../../../model/Cost";
import { phaseIn } from "../../../components/PhaseIn";
import { combineLatestWith } from "rxjs/operators";

const escalationRates$ = from(
    fetch("http://localhost:8080/api/zip-state", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            zip: 17860
        })
    })
);

escalationRates$.subscribe(console.log);

const energyCost$ = cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));
//const usageIndex$ = energyCost$.pipe(map((cost) => cost.useIndex));

const { component: FuelTypeDropdown } = dropdown(
    Object.values(FuelType),
    energyCost$.pipe(map((cost) => cost.fuelType))
);
const { component: CustomerSectorDropdown } = dropdown(
    Object.values(CustomerSector),
    energyCost$.pipe(map((cost) => cost.customerSector))
);
const { component: CostPerUnitInput, onChange$: costPerUnitChange$ } = numberInput();
const { component: AnnualConsumption, onChange$: annualConsumptionChange$ } = numberInput();
const { component: UnitDropdown, change$: unitChange$ } = dropdown(Object.values(EnergyUnit));
const { component: PhaseIn } = phaseIn();
const { component: UseIndex } = phaseIn();

export const energyCostChange$ = combineLatest({
    costPerUnit: costPerUnitChange$,
    annualConsumption: annualConsumptionChange$,
    unit: unitChange$
});

export default function EnergyCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <FuelTypeDropdown className={"w-full"} label={"Fuel Type"} />
                <CustomerSectorDropdown className={"w-full"} label={"Customer Sector"} />
                <AnnualConsumption
                    className={"w-full"}
                    addonAfter={<UnitDropdown className={"min-w-[75px]"} placeholder={EnergyUnit.KWH} />}
                    label={"Annual Consumption"}
                    controls
                />
                <CostPerUnitInput className={"w-full"} label={"Cost per Unit"} controls prefix={"$"} />
                <PhaseIn />
                <UseIndex />
            </div>
        </div>
    );
}
