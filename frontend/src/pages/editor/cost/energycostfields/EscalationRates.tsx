import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import Decimal from "decimal.js";
import { EscalationRateModel } from "model/EscalationRateModel";
import { Model } from "model/Model";
import { type ReactNode, useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { type Observable, Subject, combineLatest, distinctUntilChanged, map, merge, switchMap } from "rxjs";
import { P, match } from "ts-pattern";
import { isFalse, isTrue } from "util/Operators";
import { percentFormatter } from "util/Util";

type EscalationRatesProps = {
    title: ReactNode;
    defaultRates$?: Observable<number[]>;
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
            const value = new Decimal(row.escalationRate).mul(100);

            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={value.toNumber()}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: new Decimal(event.currentTarget.value).div(100).toNumber(),
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

const studyPeriodDefaultRates$ = Model.studyPeriod$.pipe(map((studyPeriod) => Array((studyPeriod ?? 1) + 1).fill(0)));

export default function EscalationRates({ title, defaultRates$ = studyPeriodDefaultRates$ }: EscalationRatesProps) {
    const { useEscalation, newRates, sIsConstant$, isConstant$, sConstantChange$, newRate$ } = useMemo(() => {
        const sIsConstant$ = new Subject<boolean>();
        const isConstant$ = EscalationRateModel.escalation$.pipe(
            map((escalation) => !Array.isArray(escalation)),
            distinctUntilChanged(),
            shareLatest(),
        );

        const [gridRatesChange$, newRates] = createSignal<EscalationRateInfo[]>();
        const sConstantChange$ = new Subject<number>();
        const escalationRateChange$ = gridRatesChange$.pipe(
            map((newRates) => newRates.map((rate) => rate.escalationRate)),
        );

        // Converts the escalation rates into the format the grid needs
        const [useEscalation] = bind(
            combineLatest([Model.releaseYear$, EscalationRateModel.escalation$]).pipe(
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

        const newRate$ = merge(
            // Set to default constant
            sIsConstant$.pipe(
                isTrue(),
                map(() => 0.0),
            ),

            sIsConstant$.pipe(
                isFalse(),
                map(() => []),
            ),

            // Fetch and set to default escalation rates
            sIsConstant$.pipe(
                isFalse(),
                switchMap(() => defaultRates$),
            ),

            escalationRateChange$,
            sConstantChange$,
        );

        return {
            useEscalation,
            newRates,
            sIsConstant$,
            isConstant$,
            sConstantChange$,
            newRate$,
        };
    }, [defaultRates$]);

    useEffect(() => {
        const sub = newRate$.subscribe(EscalationRateModel.escalationChange);

        return () => sub.unsubscribe();
    }, [newRate$]);

    const rates = useEscalation();

    return (
        <div>
            <Title level={5}>{title}</Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"text-md pb-1"}>Constant</p>
                <Switch value$={isConstant$} wire={sIsConstant$} checkedChildren={"Yes"} unCheckedChildren={"No"} />
            </span>

            {match(rates)
                .with(P.array(), (rates) => (
                    <div className={"w-full overflow-hidden rounded shadow-lg"}>
                        <DataGrid
                            className={"h-full rdg-light"}
                            rows={rates}
                            columns={COLUMNS}
                            onRowsChange={newRates}
                        />
                    </div>
                ))
                .otherwise(() => (
                    <div>
                        <NumberInput
                            className={"w-full"}
                            label={"Constant Escalation Rate"}
                            showLabel={false}
                            value$={EscalationRateModel.escalation$ as Observable<number>}
                            wire={sConstantChange$}
                            addonAfter={"%"}
                        />
                    </div>
                ))}
        </div>
    );
}
