import { filter, map, Observable } from "rxjs";
import { CostTypes, CustomerSector, EnergyCost, EnergyUnit, FuelType } from "../../../blcc-format/Format";
import dropdown from "../../../components/Dropdown";
import numberInput from "../../../components/InputNumber";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { phaseIn } from "../../../components/PhaseIn";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { bind } from "@react-rxjs/core";
import { Collection } from "dexie";

/*const escalationRates$ = from(
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

escalationRates$.subscribe(console.log);*/

// If we are on this page that means the cost collection can be narrowed to EnergyCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<EnergyCost, number>>;
const energyCost$ = cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

const [useUnit, unit$] = bind(energyCost$.pipe(map((cost) => cost.unit)), EnergyUnit.KWH);

const { change$: fuelType$, component: FuelTypeDropdown } = dropdown(
    Object.values(FuelType),
    energyCost$.pipe(map((cost) => cost.fuelType))
);
const { component: CustomerSectorDropdown, change$: customerSector$ } = dropdown(
    Object.values(CustomerSector),
    energyCost$.pipe(map((cost) => cost.customerSector))
);
const { component: CostPerUnitInput, onChange$: costPerUnitChange$ } = numberInput(
    energyCost$.pipe(map((cost) => cost.costPerUnit))
);
const { component: AnnualConsumption, onChange$: annualConsumptionChange$ } = numberInput(
    energyCost$.pipe(map((cost) => cost.annualConsumption))
);
const { component: UnitDropdown, change$: unitChange$ } = dropdown(Object.values(EnergyUnit), unit$);
const { component: RebateInput, onChange$: rebateChange$ } = numberInput(
    energyCost$.pipe(map((cost) => cost.rebate)),
    true
);
const { component: PhaseIn } = phaseIn();
const { component: UseIndex } = phaseIn();

export default function EnergyCostFields() {
    useDbUpdate(customerSector$, costCollection$, "customerSector");
    useDbUpdate(fuelType$, costCollection$, "fuelType");
    useDbUpdate(costPerUnitChange$, costCollection$, "costPerUnit");
    useDbUpdate(annualConsumptionChange$, costCollection$, "annualConsumption");
    useDbUpdate(unitChange$, costCollection$, "unit");
    useDbUpdate(rebateChange$, costCollection$, "rebate");

    //TODO add other fields

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <FuelTypeDropdown className={"w-full"} label={"Fuel Type"} />
                <CustomerSectorDropdown className={"w-full"} label={"Customer Sector"} />

                <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                    <AnnualConsumption
                        className={"w-full"}
                        addonAfter={<UnitDropdown className={"min-w-[75px]"} placeholder={EnergyUnit.KWH} />}
                        label={"Annual Consumption"}
                        controls
                    />
                    <CostPerUnitInput
                        className={"w-full"}
                        label={"Cost per Unit"}
                        controls
                        addonAfter={`per ${useUnit()}`}
                        prefix={"$"}
                    />
                    <RebateInput className={"w-full"} label={"Rebate"} addonBefore={"$"} />
                </div>

                <PhaseIn />
                <UseIndex />
            </div>
        </div>
    );
}
