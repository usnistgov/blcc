import { bind } from "@react-rxjs/core";
import type { Collection } from "dexie";
import { type Observable, map, merge } from "rxjs";
import { CustomerSector, type EnergyCost, EnergyUnit, FuelType } from "../../../../blcc-format/Format";
import constantOrTable from "../../../../components/ConstantOrTable";
import dropdown from "../../../../components/Dropdown";
import numberInput from "../../../../components/InputNumber";
import { useDbUpdate } from "../../../../hooks/UseDbUpdate";
import {
    costCollection$ as baseCostCollection$,
    energyCost$,
    fuelType$,
    sector$,
    useIndex$,
} from "../../../../model/CostModel";
import { min } from "../../../../model/rules/Rules";
import EscalationRates from "./EscalationRates";

// If we are on this page that means the cost collection can be narrowed to EnergyCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<EnergyCost, number>>;

const [useUnit, unit$] = bind(energyCost$.pipe(map((cost) => cost.unit)), EnergyUnit.KWH);

const { change$: fuelTypeChange$, component: FuelTypeDropdown } = dropdown(Object.values(FuelType), fuelType$);
const { component: CustomerSectorDropdown, change$: customerSector$ } = dropdown(
    Object.values(CustomerSector),
    sector$,
);
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
const { component: UnitDropdown, change$: unitChange$ } = dropdown(Object.values(EnergyUnit), unit$);
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

const { component: UseIndexComponent, toggleConstant$: usageIndexToggle$ } = constantOrTable(useIndex$);

export default function EnergyCostFields() {
    useDbUpdate(customerSector$, costCollection$, "customerSector");
    useDbUpdate(fuelTypeChange$, costCollection$, "fuelType");
    useDbUpdate(costPerUnitChange$, costCollection$, "costPerUnit");
    useDbUpdate(annualConsumptionChange$, costCollection$, "annualConsumption");
    useDbUpdate(unitChange$, costCollection$, "unit");
    useDbUpdate(rebateChange$, costCollection$, "rebate");
    useDbUpdate(demandChargeChange$, costCollection$, "demandCharge");
    useDbUpdate(
        merge(usageIndexToggle$.pipe(map((isConstant) => (isConstant ? 0.0 : [])))),
        costCollection$,
        "useIndex",
    );

    //TODO add other fields

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <FuelTypeDropdown className={"w-full"} label={"Fuel Type"} />
                <CustomerSectorDropdown className={"w-full"} label={"Customer Sector"} />

                <AnnualConsumption
                    className={"w-full"}
                    addonAfter={<UnitDropdown className={"min-w-[75px]"} placeholder={EnergyUnit.KWH} />}
                    controls
                />
                <CostPerUnitInput className={"w-full"} controls addonAfter={`per ${useUnit()}`} prefix={"$"} />

                <RebateInput className={"w-full"} addonBefore={"$"} />
                <DemandChargeInput className={"w-full"} addonBefore={"$"} />

                <EscalationRates title={"Escalation Rates"} />
                {/*                <UseIndexComponent title={"Usage Index"}>
                    <div className={"w-full overflow-hidden rounded shadow-lg"}>
                        <DataGrid
                            className={"h-full"}
                            rows={escalationRates}
                            columns={[
                                {
                                    name: "Year",
                                    key: "year",
                                },
                                {
                                    name: "Usage",
                                    key: "usage",
                                    renderEditCell: textEditor,
                                    renderCell: (info: RenderCellProps<EscalationRateInfo, unknown>) => {
                                        return percentFormatter.format(info.row.escalationRate);
                                    },
                                },
                            ]}
                        />
                    </div>
                </UseIndexComponent>*/}
            </div>
        </div>
    );
}
