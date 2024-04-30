import { catchError, combineLatest, combineLatestWith, filter, map, merge, of, switchMap, tap, type Observable } from "rxjs";
import { CostTypes, CustomerSector, type EnergyCost, EnergyUnit, FuelType } from "../../../blcc-format/Format";
import dropdown from "../../../components/Dropdown";
import numberInput from "../../../components/InputNumber";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { bind } from "@react-rxjs/core";
import type { Collection } from "dexie";
import { min } from "../../../model/rules/Rules";
import DataGrid, { type RenderEditCellProps, textEditor, type RenderCellProps } from "react-data-grid";
import { releaseYear$, studyPeriod$, zip$ } from "../../../model/Model";
import { ajax } from "rxjs/internal/ajax/ajax";
import { percentFormatter } from "../../../util/Util";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { guard, isTrue } from "../../../util/Operators";
import switchComp from "../../../components/Switch";
import constantOrTable from "../../../components/ConstantOrTable";

type EscalationRateRespone = {
    case: string;
    release_year: number;
    year: number;
    divison: string;
    electricity: number;
    natural_gas: number;
    propane: number;
    region: string;
    residual_fuel_oil: number;
    distillate_fuel_oil: number;
    sector: string;
}

type EscalationRateInfo = {
    year: number;
    escalationRate: number;
}


// If we are on this page that means the cost collection can be narrowed to EnergyCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<EnergyCost, number>>;
const energyCost$ = cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

const fuelType$ = energyCost$.pipe(map((cost) => cost.fuelType));
const sector$ = energyCost$.pipe(map((cost) => cost?.customerSector ?? CustomerSector.RESIDENTIAL));
const escalation$ = energyCost$.pipe(map((cost) => cost?.escalation), guard());

const [isConstant, isConstant$] = bind(
    energyCost$.pipe(map((cost) => !Array.isArray(cost?.escalation ?? 0))),
    true
);

const [useEscalation] = bind(combineLatest([releaseYear$, escalation$]).pipe(
    map(([releaseYear, escalation]) => {
        if (Array.isArray(escalation)) {
            return escalation.map((rate, i) => ({
                year: releaseYear + i,
                escalationRate: rate
            }))
        }

        return [];
    })
), []);

const [useEscalationRates, escalationRates$] = bind(
    combineLatest([releaseYear$, studyPeriod$, zip$, sector$]).pipe(
        switchMap(([releaseYear, studyPeriod, zip, sector]) =>
            ajax<EscalationRateRespone[]>({
                url: "/api/escalation-rates",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    from: releaseYear,
                    to: releaseYear + (studyPeriod ?? 0),
                    zip: Number.parseInt(zip ?? "0"),
                    sector
                }

            })
        ),
        map((response) => response.response),
        combineLatestWith(fuelType$),
        map(([response, fuelType]) => response.map((value) => {
            function getEscalationRate() {
                switch (fuelType) {
                    case FuelType.ELECTRICITY:
                        return value.electricity;
                    case FuelType.PROPANE:
                        return value.propane;
                    case FuelType.DISTILLATE_OIL:
                        return value.distillate_fuel_oil;
                    case FuelType.RESIDUAL_OIL:
                        return value.residual_fuel_oil;
                    case FuelType.NATURAL_GAS:
                        return value.natural_gas;
                    case FuelType.OTHER:
                        return 0;
                }
            }

            return {
                year: value.year,
                escalationRate: getEscalationRate()
            }
        })),
        catchError(() => of([]))
    ),
    []
);

const { component: ConstantSwitch } = switchComp(isConstant$);

const [useUnit, unit$] = bind(energyCost$.pipe(map((cost) => cost.unit)), EnergyUnit.KWH);

const { change$: fuelTypeChange$, component: FuelTypeDropdown } = dropdown(
    Object.values(FuelType),
    fuelType$
);
const { component: CustomerSectorDropdown, change$: customerSector$ } = dropdown(
    Object.values(CustomerSector),
    sector$
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

const [escalationRatesChange$, newRates] = createSignal<EscalationRateInfo[]>();

escalationRatesChange$.subscribe(console.log)

const {
    component: EscalationRateComponent,
    toggleConstant$
} = constantOrTable(
    escalationRates$,
    isConstant$,
    ({ row, column, onRowChange }: RenderEditCellProps<EscalationRateInfo, unknown>) => {
        return <input
            className={"w-full pl-4"}
            type={"number"}
            defaultValue={row.escalationRate * 100}
            onChange={(event) => onRowChange({
                ...row,
                [column.key]: Number.parseFloat(event.currentTarget.value) / 100
            })}
        />
    },
    (info: RenderCellProps<EscalationRateInfo, unknown>) => {
        return percentFormatter.format(info.row.escalationRate);
    }
);


export default function EnergyCostFields() {
    useDbUpdate(customerSector$, costCollection$, "customerSector");
    useDbUpdate(fuelTypeChange$, costCollection$, "fuelType");
    useDbUpdate(costPerUnitChange$, costCollection$, "costPerUnit");
    useDbUpdate(annualConsumptionChange$, costCollection$, "annualConsumption");
    useDbUpdate(unitChange$, costCollection$, "unit");
    useDbUpdate(rebateChange$, costCollection$, "rebate");
    useDbUpdate(demandChargeChange$, costCollection$, "demandCharge");
    useDbUpdate(
        merge(
            escalationRatesChange$.pipe(
                map((newRates) => newRates.map((rate) => rate.escalationRate)),
            ),
            toggleConstant$.pipe(
                map((isConstant) => isConstant ? 0.0 : [])
            )
        ),
        costCollection$,
        "escalation"
    );

    //TODO add other fields

    const escalationRates = useEscalation();

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

                <EscalationRateComponent
                    title={"Escalation Rates"}
                    tableHeader={"Escalation Rate (%)"}
                    key={"escalationRate"}
                />

                <div>
                    <Title level={5}>Escalation Rates</Title>
                    <span className={"flex flex-row items-center gap-2 pb-2"}>
                        <p className={"text-md pb-1"}>Constant</p>
                        <ConstantSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                    </span>
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
                                    key: "escalationRate",
                                    renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<EscalationRateInfo, unknown>) => {
                                        return <input
                                            className={"w-full pl-4"}
                                            type={"number"}
                                            defaultValue={row.escalationRate * 100}
                                            onChange={(event) => onRowChange({
                                                ...row,
                                                [column.key]: Number.parseFloat(event.currentTarget.value) / 100
                                            })}
                                        />
                                    },
                                    editable: true,
                                    renderCell: (info: RenderCellProps<EscalationRateInfo, unknown>) => {
                                        return percentFormatter.format(info.row.escalationRate);
                                    }
                                }
                            ]}
                            onRowsChange={newRates}
                        />
                    </div>
                </div>
                <div>
                    <Title level={5}>Usage Index</Title>
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
                                    name: "EscalationRate (%)",
                                    key: "escalationRate",
                                    renderEditCell: textEditor,
                                    renderCell: (info: RenderCellProps<EscalationRateInfo, unknown>) => {
                                        return percentFormatter.format(info.row.escalationRate);
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
