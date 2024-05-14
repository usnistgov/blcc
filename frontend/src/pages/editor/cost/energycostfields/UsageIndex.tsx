import { bind, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, textEditor } from "react-data-grid";
import { Subject, combineLatest, map, merge, switchMap } from "rxjs";
import { filter, shareReplay } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { NumberInput } from "../../../../components/InputNumber";
import Switch from "../../../../components/Switch";
import { releaseYear$ } from "../../../../model/Model";
import { useIndex$, useIndexChange } from "../../../../model/costs/EnergyCostModel";
import { isFalse, isTrue } from "../../../../util/Operators";
import { percentFormatter } from "../../../../util/Util";

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
        name: "Usage",
        key: "usage",
        renderEditCell: textEditor,
        renderCell: (info: RenderCellProps<UsageIndexInfo>) => {
            return percentFormatter.format(info.row.usage);
        },
    },
];

export default function UsageIndex({ title }: UsageIndexProps) {
    const { useUsage, sIsConstant$, isConstant$, sConstantChange$, newRates, constantUsage$, newRate$ } =
        useMemo(() => {
            const sIsConstant$ = new Subject<boolean>();

            const [gridChange$, newRates] = createSignal<UsageIndexInfo[]>();
            const sConstantChange$ = new Subject<number>();
            const usageRateChange$ = gridChange$.pipe(map((newRates) => newRates.map((rate) => rate.usage)));

            // Represents whether the escalation rates is a constant value or an array
            const isConstant$ = state(useIndex$.pipe(map((rates) => !Array.isArray(rates))), true);

            // Converts the usage rates into the format the grid needs
            const [useUsage] = bind(
                combineLatest([releaseYear$, useIndex$]).pipe(
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

            const constantUsage$ = state(
                useIndex$.pipe(
                    filter((rate): rate is number => !Array.isArray(rate)),
                    shareReplay(1),
                ),
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
                    map(() => [] as number[]),
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
                constantUsage$,
                newRate$,
            };
        }, []);

    useEffect(() => {
        const sub = newRate$.subscribe(useIndexChange);

        return () => sub.unsubscribe();
    }, [newRate$]);

    const rates = useUsage();

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
                            value$={constantUsage$}
                            wire={sConstantChange$}
                        />
                    </div>
                ))}
        </div>
    );
}
