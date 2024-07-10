import { bind, shareLatest, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { Model } from "model/Model";
import { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { Subject, combineLatest, map, merge, switchMap } from "rxjs";
import { filter } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { isFalse, isTrue } from "util/Operators";
import { percentFormatter } from "util/Util";
import { EnergyCostModel } from "../../../../model/costs/EnergyCostModel";

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
                    defaultValue={row.escalationRate}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: Number.parseFloat(event.currentTarget.value),
                        })
                    }
                />
            );
        },
        editable: true,
        renderCell: (info: RenderCellProps<EscalationRateInfo>) => {
            return percentFormatter.format(info.row.escalationRate / 100);
        },
    },
];

export default function EscalationRates({ title }: EscalationRatesProps) {
    const {
        useEscalation,
        newRates,
        escalationRateChange$,
        sIsConstant$,
        constantEscalation$,
        sConstantChange$,
        newRate$,
    } = useMemo(() => {
        const sIsConstant$ = new Subject<boolean>();
        const isConstant$ = sIsConstant$.pipe(shareLatest());

        const [gridRatesChange$, newRates] = createSignal<EscalationRateInfo[]>();
        const sConstantChange$ = new Subject<number>();
        const escalationRateChange$ = gridRatesChange$.pipe(
            map((newRates) => newRates.map((rate) => rate.escalationRate)),
        );

        // Converts the escalation rates into the format the grid needs
        const [useEscalation] = bind(
            combineLatest([Model.releaseYear$, EnergyCostModel.escalation$]).pipe(
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
            EnergyCostModel.escalation$.pipe(filter((rate): rate is number => !Array.isArray(rate))),
            0.0,
        );

        const newRate$ = merge(
            // Set to default constant
            isConstant$.pipe(
                isTrue(),
                map(() => 0.0),
            ),

            // Fetch and set to default escalation rates
            isConstant$.pipe(
                isFalse(),
                switchMap(() => EnergyCostModel.fetchEscalationRates$),
            ),

            escalationRateChange$,
            sConstantChange$,
        );

        constantEscalation$.subscribe(console.log);

        return {
            useEscalation,
            newRates,
            escalationRateChange$,
            sIsConstant$,
            constantEscalation$,
            sConstantChange$,
            newRate$,
        };
    }, []);

    useEffect(() => {
        const sub = newRate$.subscribe(EnergyCostModel.rateChange);

        return () => sub.unsubscribe();
    }, [newRate$]);

    const rates = useEscalation();

    return (
        <div>
            <Title level={5}>{title}</Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"text-md pb-1"}>Constant</p>
                <Switch wire={sIsConstant$} checkedChildren={"Yes"} unCheckedChildren={"No"} />
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
