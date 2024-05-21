import type { Collection } from "dexie";
import { type Observable, map } from "rxjs";
import { CustomerSector, type EnergyCost, EnergyUnit, FuelType, type Unit } from "../../../../blcc-format/Format";
import { Dropdown } from "../../../../components/Dropdown";
import numberInput from "../../../../components/InputNumber";
import { useDbUpdate } from "../../../../hooks/UseDbUpdate";
import { CostModel } from "../../../../model/CostModel";
import {
    customerSector$,
    energyCost$,
    fuelType$,
    sFuelTypeChange$,
    sSectorChange$,
    sUnitChange$,
    unit$,
    useUnit,
} from "../../../../model/costs/EnergyCostModel";
import { min } from "../../../../model/rules/Rules";
import EscalationRates from "./EscalationRates";
import UsageIndex from "./UsageIndex";

// If we are on this page that means the cost collection can be narrowed to EnergyCost.
const costCollection$ = CostModel.collection$ as Observable<Collection<EnergyCost, number>>;

const { component: CostPerUnitInput, onChange$: costPerUnitChange$ } = numberInput(
    "Cost per Unit",
    "/",
    energyCost$.pipe(map((cost) => cost.costPerUnit)),
);
const { component: AnnualConsumption, onChange$: annualConsumptionChange$ } = numberInput(
    "Annual Consumption",
    `${window.location.pathname}#Annual-Consumption`,
    energyCost$.pipe(map((cost) => cost.annualConsumption)),
    false,
    [min(0)],
);
const { component: RebateInput, onChange$: rebateChange$ } = numberInput(
    "Rebate",
    "/",
    energyCost$.pipe(map((cost) => cost.rebate)),
    true,
);
const { component: DemandChargeInput, onChange$: demandChargeChange$ } = numberInput(
    "Demand Charge",
    "/",
    energyCost$.pipe(map((cost) => cost.demandCharge)),
    true,
);

export default function EnergyCostFields() {
    useDbUpdate(costPerUnitChange$, costCollection$, "costPerUnit");
    useDbUpdate(annualConsumptionChange$, costCollection$, "annualConsumption");
    useDbUpdate(rebateChange$, costCollection$, "rebate");
    useDbUpdate(demandChargeChange$, costCollection$, "demandCharge");

    //TODO add other fields

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <Dropdown
                    className={"w-full"}
                    label={"Fuel Type"}
                    options={Object.values(FuelType)}
                    value$={fuelType$}
                    wire={sFuelTypeChange$}
                    showSearch
                />
                <Dropdown
                    className={"w-full"}
                    label={"Customer Sector"}
                    options={Object.values(CustomerSector)}
                    value$={customerSector$}
                    wire={sSectorChange$}
                    showSearch
                />

                <AnnualConsumption
                    className={"w-full"}
                    addonAfter={
                        <Dropdown
                            className={"min-w-[75px]"}
                            placeholder={EnergyUnit.KWH}
                            options={Object.values(EnergyUnit) as Unit[]}
                            value$={unit$}
                            wire={sUnitChange$}
                        />
                    }
                    controls
                />
                <CostPerUnitInput className={"w-full"} controls addonAfter={`per ${useUnit()}`} prefix={"$"} />

                <RebateInput className={"w-full"} addonBefore={"$"} />
                <DemandChargeInput className={"w-full"} addonBefore={"$"} />

                <EscalationRates title={"Escalation Rates"} />
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}
