import { bind, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { Subject, combineLatest, map, merge, switchMap } from "rxjs";
import { filter } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { NumberInput } from "../../../../components/InputNumber";
import Switch from "../../../../components/Switch";
import { Model } from "../../../../model/Model";
import { escalation$, fetchEscalationRates$, rateChange } from "../../../../model/costs/EnergyCostModel";
import { isFalse, isTrue } from "../../../../util/Operators";
import { percentFormatter } from "../../../../util/Util";

type EscalationRatesProps = {
    title: string;
};

type EscalationRateInfo = {
    year: number;
    escalationRate: number;
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
        const isConstant$ = state(escalation$.pipe(map((rates) => !Array.isArray(rates))), false);

        // Converts the escalation rates into the format the grid needs
        const [useEscalation] = bind(
            combineLatest([Model.releaseYear$, escalation$]).pipe(
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
        const sub = newRate$.subscribe(rateChange);

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
