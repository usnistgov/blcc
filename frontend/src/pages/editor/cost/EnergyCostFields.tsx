import { combineLatest, filter, map, of, switchMap, type Observable } from "rxjs";
import { CostTypes, CustomerSector, type EnergyCost, EnergyUnit, FuelType } from "../../../blcc-format/Format";
import dropdown from "../../../components/Dropdown";
import numberInput from "../../../components/InputNumber";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { phaseIn } from "../../../components/PhaseIn";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { bind } from "@react-rxjs/core";
import type { Collection } from "dexie";
import { min } from "../../../model/rules/Rules";
import DataGrid from "react-data-grid";
import phaseInDataGrid, { editorGrid } from "../../../components/PhaseInDataGrid";
import { releaseYear$, studyPeriod$ } from "../../../model/Model";
import { ajax } from "rxjs/internal/ajax/ajax";

const [useEscalationRates, escalationRates$] = bind(
    combineLatest([releaseYear$, studyPeriod$]).pipe(
        switchMap(([releaseYear, studyPeriod]) =>
            ajax<number[]>({
                url: "/api/escalation-rates",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    from: releaseYear,
                    to: releaseYear + (studyPeriod ?? 0)
                }
            })
        ),
        map((response) => response.response)
    ),
    []);

escalationRates$.subscribe(console.log)

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
    "Cost per Unit",
    "/",
    energyCost$.pipe(map((cost) => cost.costPerUnit))
);
const { component: AnnualConsumption, onChange$: annualConsumptionChange$ } = numberInput(
    "Annual Consumption",
    `${window.location.pathname}#Annual-Consumption`,
    energyCost$.pipe(map((cost) => cost.annualConsumption)),
    false,
    [min(0)]
);
const { component: UnitDropdown, change$: unitChange$ } = dropdown(Object.values(EnergyUnit), unit$);
const { component: RebateInput, onChange$: rebateChange$ } = numberInput(
    "Rebate",
    "/",
    energyCost$.pipe(map((cost) => cost.rebate)),
    true
);
const { component: DemandChargeInput, onChange$: demandChargeChange$ } = numberInput(
    "Demand Charge",
    "/",
    energyCost$.pipe(map((cost) => cost.demandCharge)),
    true
);

export default function EnergyCostFields() {
    useDbUpdate(customerSector$, costCollection$, "customerSector");
    useDbUpdate(fuelType$, costCollection$, "fuelType");
    useDbUpdate(costPerUnitChange$, costCollection$, "costPerUnit");
    useDbUpdate(annualConsumptionChange$, costCollection$, "annualConsumption");
    useDbUpdate(unitChange$, costCollection$, "unit");
    useDbUpdate(rebateChange$, costCollection$, "rebate");
    useDbUpdate(demandChargeChange$, costCollection$, "demandCharge");

    //TODO add other fields

    const escalationRates = useEscalationRates();

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

                <div className={"w-full overflow-hidden rounded shadow-lg"}>
                    <DataGrid
                        className={"h-full"}
                        rows={escalationRates}
                        columns={[
                            {
                                name: "Year",
                                key: "year"
                            },
                            {
                                name: "Escalation Rate (%)",
                                key: "escalationRate"
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
