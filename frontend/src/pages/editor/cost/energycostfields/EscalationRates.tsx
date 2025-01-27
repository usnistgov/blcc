import { mdiRefresh } from "@mdi/js";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { Button, ButtonType } from "components/input/Button";
import { TestNumberInput } from "components/input/TestNumberInput";
import { type EscalationRateInfo, EscalationRateModel } from "model/EscalationRateModel";
import type { ReactNode } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { Link } from "react-router-dom";
import type { Observable } from "rxjs";
import { percentFormatter, toDecimal, toPercentage } from "util/Util";

type EscalationRatesProps = {
    title: ReactNode;
    defaultRates$?: Observable<number[]>;
};

const COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Escalation Rate (%)",
        key: "rate",
        renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<EscalationRateInfo>) => {
            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={toPercentage(row.rate)}
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
            return percentFormatter.format(info.row.rate);
        },
    },
];

export default function EscalationRates({ title }: EscalationRatesProps) {
    const isConstant = EscalationRateModel.isConstant();
    const areProjectRatesValid = EscalationRateModel.areProjectRatesValid();

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
                        disabled={!areProjectRatesValid}
                        onClick={() => EscalationRateModel.Actions.resetToDefault()}
                    />
                )}
            </div>
            {(isConstant && <ConstantEscalationInput />) || <ArrayEscalationInput />}
        </div>
    );
}

function ArrayEscalationInput() {
    const areProjectRatesValid = EscalationRateModel.areProjectRatesValid();
    const isUsingCustomEscalationRates = EscalationRateModel.isUsingCustomEscalationRates();

    // Show the grid if the project rates are valid so we can use those values, or if there are custom rates set
    // This allows us to display the grid if we convert an old file with escalation rates without needing to set
    // the zip code
    const showGrid = areProjectRatesValid || isUsingCustomEscalationRates;

    return (
        (showGrid && (
            <div className={"w-full overflow-hidden rounded shadow-lg"}>
                <DataGrid
                    className={"rdg-light h-full"}
                    rows={EscalationRateModel.gridValues()}
                    columns={COLUMNS}
                    onRowsChange={EscalationRateModel.Actions.setRates}
                />
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
