import { bind, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Title from "antd/es/typography/Title";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { Model } from "model/Model";
import { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, textEditor } from "react-data-grid";
import { type Observable, Subject, combineLatest, map, merge } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { isFalse, isTrue } from "util/Operators";
import { array, percentFormatter } from "util/Util";
import { EnergyCostModel } from "../../../../model/costs/EnergyCostModel";

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
            return percentFormatter.format(info.row.usage / 100);
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
        const isConstant$ = state(EnergyCostModel.useIndex$.pipe(map((rates) => !Array.isArray(rates))), true);

        // Converts the usage rates into the format the grid needs
        const [useUsage] = bind(
            combineLatest([Model.releaseYear$, EnergyCostModel.useIndex$]).pipe(
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
                map(() => 100.0),
            ),

            // Fetch and set to default escalation rates
            sIsConstant$.pipe(
                isFalse(),
                withLatestFrom(Model.studyPeriod$),
                map(([_, studyPeriod]) => Array((studyPeriod ?? 1) + 1).fill(100)),
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
        const sub = newRate$.subscribe(EnergyCostModel.useIndexChange);

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
                            value$={EnergyCostModel.useIndex$ as Observable<number>}
                            wire={sConstantChange$}
                            addonAfter={"%"}
                        />
                    </div>
                ))}
        </div>
    );
}
