import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { NumberInput } from "components/input/InputNumber";
import { EscalationRateModel } from "model/EscalationRateModel";
import { Model } from "model/Model";
import { type ReactNode, useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { type Observable, Subject, combineLatest, distinctUntilChanged, map, merge, switchMap } from "rxjs";
import { P, match } from "ts-pattern";
import { isFalse, isTrue } from "util/Operators";
import { percentFormatter, toDecimal, toPercentage } from "util/Util";

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
            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={toPercentage(row.escalationRate)}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: toDecimal(event.currentTarget.value),
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

const studyPeriodDefaultRates$ = Model.studyPeriod.$.pipe(map((studyPeriod) => Array((studyPeriod ?? 1) + 1).fill(0)));

export default function EscalationRates({ title, defaultRates$ }: EscalationRatesProps) {
    /*    const { useEscalation, newRates, sConstantChange$ } = useMemo(() => {
        const [gridRatesChange$, newRates] = createSignal<EscalationRateInfo[]>();
        const sConstantChange$ = new Subject<number>();
        const escalationRateChange$ = gridRatesChange$.pipe(
            map((newRates) => newRates.map((rate) => rate.escalationRate)),
        );

        // Converts the escalation rates into the format the grid needs
        const [useEscalation] = bind(
            combineLatest([Model.releaseYear.$, EscalationRateModel.escalation$]).pipe(
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

        return {
            useEscalation,
            newRates,
            sConstantChange$,
        };
    }, []);*/

    /*const rates = useEscalation();*/

    const isConstant = EscalationRateModel.isConstant();

    return (
        <div>
            <Title level={5}>{title}</Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"pb-1 text-md"}>Constant</p>
                <Switch
                    value={isConstant}
                    onChange={EscalationRateModel.Actions.toggleConstant}
                    checkedChildren={"Yes"}
                    unCheckedChildren={"No"}
                />
            </span>
            {(isConstant && <ConstantEscalationInput />) || <ArrayEscalationInput />}
        </div>
    );
}

function ArrayEscalationInput() {
    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            {/*<DataGrid className={"rdg-light h-full"} rows={rates} columns={COLUMNS} onRowsChange={newRates} />*/}
        </div>
    );
}

function ConstantEscalationInput() {
    return (
        <div>
            {/*            <NumberInput
                className={"w-full"}
                label={"Constant Escalation Rate"}
                showLabel={false}
                value$={EscalationRateModel.escalation$ as Observable<number>}
                percent
                wire={sConstantChange$}
                addonAfter={"%"}
            />*/}
        </div>
    );
}
