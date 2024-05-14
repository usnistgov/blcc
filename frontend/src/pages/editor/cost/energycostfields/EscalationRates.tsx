import { bind, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { Subject, catchError, combineLatest, combineLatestWith, map, merge, of, switchMap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { filter, tap } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { FuelType } from "../../../../blcc-format/Format";
import { NumberInput } from "../../../../components/InputNumber";
import Switch from "../../../../components/Switch";
import { releaseYear$, studyPeriod$, zip$ } from "../../../../model/Model";
import { escalation$, fuelType$, rateChange, sector$ } from "../../../../model/costs/EnergyCostModel";
import { isFalse, isTrue } from "../../../../util/Operators";
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

export default function EscalationRates({ title }: EscalationRatesProps) {
    const {
        useEscalation,
        isConstant$,
        newRates,
        escalationRateChange$,
        sIsConstant$,
        constantEscalation$,
        sConstantChange$,
        newRate$,
    } = useMemo(() => {
        const sIsConstant$ = new Subject<boolean>();

        const [gridRatesChange$, newRates] = createSignal<EscalationRateInfo[]>();
        const sConstantChange$ = new Subject<number>();
        const escalationRateChange$ = gridRatesChange$.pipe(
            map((newRates) => newRates.map((rate) => rate.escalationRate)),
        );

        // Represents whether the escalation rates is a constant value or an array
        const isConstant$ = state(escalation$.pipe(map((rates) => !Array.isArray(rates))));

        // Converts the escalation rates into the format the grid needs
        const [useEscalation] = bind(
            combineLatest([releaseYear$, escalation$]).pipe(
                map(([releaseYear, escalation]) =>
                    match(escalation)
                        .with(P.array(), (escalation) =>
                            escalation.map((rate, i) => ({
                                year: releaseYear + i,
                                escalationRate: rate,
                            })),
                        )
                        .otherwise((constant) => constant),
                ),
            ),
            [],
        );

        const constantEscalation$ = state(
            escalation$.pipe(filter((rate): rate is number => !Array.isArray(rate))),
            0.0,
        );

        const newRate$ = merge(
            // Set to default constant
            sIsConstant$.pipe(
                isTrue(),
                map(() => 0.0),
            ),

            // Fetch and set to default escalation rates
            sIsConstant$.pipe(
                isFalse(),
                switchMap(() => fetchEscalationRates$),
            ),

            escalationRateChange$,
            sConstantChange$,
        );

        constantEscalation$.subscribe(console.log);

        return {
            useEscalation,
            isConstant$,
            newRates,
            escalationRateChange$,
            sIsConstant$,
            constantEscalation$,
            sConstantChange$,
            newRate$,
        };
    }, []);

    useEffect(() => {
        const sub = newRate$.pipe(tap((x) => console.log("CHANGE", x))).subscribe(rateChange);

        return () => sub.unsubscribe();
    }, [newRate$]);

    const rates = useEscalation();

    return (
        <div>
            <Title level={5}>{title}</Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"text-md pb-1"}>Constant</p>
                <Switch wire={sIsConstant$} value$={isConstant$} checkedChildren={"Yes"} unCheckedChildren={"No"} />
            </span>

            {match(rates)
                .with(P.array(), (rates) => (
                    <div className={"w-full overflow-hidden rounded shadow-lg"}>
                        <DataGrid className={"h-full"} rows={rates} columns={COLUMNS} onRowsChange={newRates} />
                    </div>
                ))
                .otherwise(() => (
                    <div>
                        <NumberInput
                            className={"w-full"}
                            label={"Constant Escalation Rate"}
                            showLabel={false}
                            value$={constantEscalation$}
                            wire={sConstantChange$}
                        />
                    </div>
                ))}
        </div>
    );
}
