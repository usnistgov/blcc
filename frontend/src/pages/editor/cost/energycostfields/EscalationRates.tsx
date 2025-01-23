import { mdiRefresh } from "@mdi/js";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { Button, ButtonType } from "components/input/Button";
import { TestNumberInput } from "components/input/TestNumberInput";
import { EscalationRateModel } from "model/EscalationRateModel";
import { Model } from "model/Model";
import type { ReactNode } from "react";
import type { RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { Link } from "react-router-dom";
import { type Observable, map } from "rxjs";
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
            <div className={"flex flex-row justify-between pb-2"}>
                <span className={"flex flex-row items-center gap-2"}>
                    <p className={"pb-1 text-md"}>Constant</p>
                    <Switch
                        value={isConstant}
                        onChange={EscalationRateModel.Actions.toggleConstant}
                        checkedChildren={"Yes"}
                        unCheckedChildren={"No"}
                    />
                </span>
                {!isConstant && (
                    <Button
                        className={"-scale-x-100"}
                        icon={mdiRefresh}
                        type={ButtonType.LINK}
                        tooltip={"Reset to default"}
                        disabled
                    />
                )}
            </div>
            {(isConstant && <ConstantEscalationInput />) || <ArrayEscalationInput />}
        </div>
    );
}

function ArrayEscalationInput() {
    const areProjectRatesValid = EscalationRateModel.areProjectRatesValid();

    return (
        (areProjectRatesValid && (
            <div className={"w-full overflow-hidden rounded shadow-lg"}>
                {/*<DataGrid className={"rdg-light h-full"} rows={rates} columns={COLUMNS} onRowsChange={newRates} />*/}
            </div>
        )) || (
            <div className={"flex flex-col gap-y-2 text-base-dark"}>
                <p>Default escalation rates requires a ZIP code</p>
                <p>
                    Set the ZIP code for this cost or for the entire project on the{" "}
                    <Link className={"text-primary"} to={"/editor"}>
                        General Information
                    </Link>{" "}
                    page
                </p>
            </div>
        )
    );
}

function ConstantEscalationInput() {
    return (
        <div>
            <TestNumberInput
                className={"w-full"}
                getter={EscalationRateModel.escalation.use as () => number}
                onChange={EscalationRateModel.Actions.setConstant}
                addonAfter={"%"}
            />
        </div>
    );
}
