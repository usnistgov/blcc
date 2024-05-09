import { bind, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { catchError, combineLatest, combineLatestWith, map, merge, of, switchMap, tap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { P, match } from "ts-pattern";
import { FuelType } from "../../../../blcc-format/Format";
import Switch from "../../../../components/Switch";
import { useDbUpdate } from "../../../../hooks/UseDbUpdate";
import { costCollection$, energyCost$, fuelType$, sector$ } from "../../../../model/CostModel";
import { releaseYear$, studyPeriod$, zip$ } from "../../../../model/Model";
import { guard, isFalse, isTrue } from "../../../../util/Operators";
import { percentFormatter } from "../../../../util/Util";

type EscalationRatesProps = {
    title: string;
};

type EscalationRateInfo = {
    year: number;
    escalationRate: number;
};

type EscalationRateResponse = {
    case: string;
    release_year: number;
    year: number;
    division: string;
    electricity: number;
    natural_gas: number;
    propane: number;
    region: string;
    residual_fuel_oil: number;
    distillate_fuel_oil: number;
    sector: string;
};

const COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Escalation Rate (%)",
        key: "escalationRate",
        renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<EscalationRateInfo>) => {
            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={row.escalationRate * 100}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: Number.parseFloat(event.currentTarget.value) / 100,
                        })
                    }
                />
            );
        },
        editable: true,
        renderCell: (info: RenderCellProps<EscalationRateInfo>) => {
            return percentFormatter.format(info.row.escalationRate);
        },
    },
];

// Get the escalation rates from the energy cost
const rates$ = state(
    energyCost$.pipe(
        map((cost) => cost?.escalation),
        guard(),
    ),
    [],
);

// Represents whether the escalation rates is a constant value or an array
const isConstant$ = state(rates$.pipe(map((rates) => !Array.isArray(rates))));

// Converts the escalation rates into the format the grid needs
const [useEscalation] = bind(
    combineLatest([releaseYear$, rates$]).pipe(
        map(([releaseYear, escalation]) =>
            match(escalation)
                .with(P.array(), (escalation) =>
                    escalation.map((rate, i) => ({
                        year: releaseYear + i,
                        escalationRate: rate,
                    })),
                )
                .otherwise(() => []),
        ),
    ),
    [],
);

// Gets the default escalation rate information from the api
const fetchEscalationRates$ = combineLatest([releaseYear$, studyPeriod$, zip$, sector$]).pipe(
    switchMap(([releaseYear, studyPeriod, zip, sector]) =>
        ajax<EscalationRateResponse[]>({
            url: "/api/escalation-rates",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                from: releaseYear,
                to: releaseYear + (studyPeriod ?? 0),
                zip: Number.parseInt(zip ?? "0"),
                sector,
            },
        }),
    ),
    map((response) => response.response),
    combineLatestWith(fuelType$),
    map(([response, fuelType]) =>
        response.map((value) =>
            match(fuelType)
                .with(FuelType.ELECTRICITY, () => value.electricity)
                .with(FuelType.PROPANE, () => value.propane)
                .with(FuelType.DISTILLATE_OIL, () => value.distillate_fuel_oil)
                .with(FuelType.RESIDUAL_OIL, () => value.residual_fuel_oil)
                .with(FuelType.NATURAL_GAS, () => value.natural_gas)
                .otherwise(() => 0),
        ),
    ),
    catchError(() => of([])),
);

const [escalationRatesToggle$, toggleEscalationRates] = createSignal<boolean>();
const [escalationRatesChange$, newRates] = createSignal<EscalationRateInfo[]>();

export default function EscalationRates({ title }: EscalationRatesProps) {
    useDbUpdate(
        merge(
            // Set to the new value
            escalationRatesChange$.pipe(map((newRates) => newRates.map((rate) => rate.escalationRate))),

            // Set to default constant
            escalationRatesToggle$.pipe(
                isTrue(),
                map(() => 0.0),
            ),

            // Fetch and set to default escalation rates
            escalationRatesToggle$.pipe(
                isFalse(),
                switchMap(() => fetchEscalationRates$),
            ),
        ).pipe(tap(console.log)),
        costCollection$,
        "escalation",
    );

    const rates = useEscalation();

    return (
        <div>
            <Title level={5}>{title}</Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"text-md pb-1"}>Constant</p>
                <Switch
                    value$={isConstant$}
                    onChange={(value) => toggleEscalationRates(value)}
                    checkedChildren={"Yes"}
                    unCheckedChildren={"No"}
                />
            </span>

            {match(rates)
                .with(P.array(), () => (
                    <div className={"w-full overflow-hidden rounded shadow-lg"}>
                        <DataGrid className={"h-full"} rows={rates} columns={COLUMNS} onRowsChange={newRates} />
                    </div>
                ))
                .otherwise(() => (
                    <></>
                ))}
        </div>
    );
}
