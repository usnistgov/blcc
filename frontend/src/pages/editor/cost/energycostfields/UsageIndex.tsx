import { bind, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";
import { UsageIndexModel } from "model/UsageIndexModel";
import { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { type Observable, Subject, combineLatest, map, merge } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { isFalse, isTrue } from "util/Operators";
import { percentFormatter, toDecimal, toPercentage } from "util/Util";

type UsageIndexProps = {
    title: string;
};

type UsageIndexInfo = {
    year: number;
    usage: number;
};

const COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Usage (%)",
        key: "usage",
        renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<UsageIndexInfo>) => {
            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={toPercentage(row.usage)}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: toDecimal(event.currentTarget.value),
                        })
                    }
                />
            );
        },
        renderCell: (info: RenderCellProps<UsageIndexInfo>) => {
            return percentFormatter.format(info.row.usage);
        },
    },
];

export default function UsageIndex({ title }: UsageIndexProps) {
    const { useUsage, sIsConstant$, isConstant$, sConstantChange$, newRates, newRate$ } = useMemo(() => {
        const sIsConstant$ = new Subject<boolean>();

        const [gridChange$, newRates] = createSignal<UsageIndexInfo[]>();
        const sConstantChange$ = new Subject<number>();
        const usageRateChange$ = gridChange$.pipe(map((newRates) => newRates.map((rate) => rate.usage)));

        // Represents whether the escalation rates is a constant value or an array
        const isConstant$ = state(UsageIndexModel.useIndex$.pipe(map((rates) => !Array.isArray(rates))), true);

        // Converts the usage rates into the format the grid needs
        const [useUsage] = bind(
            combineLatest([Model.releaseYear$, UsageIndexModel.useIndex$]).pipe(
                map(([releaseYear, useIndex]) =>
                    match(useIndex)
                        .with(P.array(), (usage) =>
                            usage.map((use, i) => ({
                                year: releaseYear + i,
                                usage: use,
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
                map(() => 1.0),
            ),

            // Fetch and set to default escalation rates
            sIsConstant$.pipe(
                isFalse(),
                withLatestFrom(Model.studyPeriod.$),
                map(([_, studyPeriod]) => Array((studyPeriod ?? 1) + 1).fill(1)),
            ),

            usageRateChange$,
            sConstantChange$,
        );

        return {
            useUsage,
            newRates,
            sIsConstant$,
            isConstant$,
            sConstantChange$,
            newRate$,
        };
    }, []);

    useEffect(() => {
        const sub = newRate$.subscribe(UsageIndexModel.useIndexChange);

        return () => sub.unsubscribe();
    }, [newRate$]);

    const rates = useUsage();

    return (
        <div>
            <Title level={5}>
                <Info text={Strings.USAGE_INDEX}>{title}</Info>
            </Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"text-md pb-1"}>Constant</p>
                <Switch wire={sIsConstant$} value$={isConstant$} checkedChildren={"Yes"} unCheckedChildren={"No"} />
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
                            value$={UsageIndexModel.useIndex$ as Observable<number>}
                            percent
                            wire={sConstantChange$}
                            addonAfter={"%"}
                        />
                    </div>
                ))}
        </div>
    );
}
