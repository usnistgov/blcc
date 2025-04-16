import { Switch, Tooltip } from "antd";
import Title from "antd/es/typography/Title";
import { Defaults } from "blcc-format/Defaults";
import Info from "components/Info";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { type RateChangeInfo, RecurringModel } from "model/costs/RecurringModel";
import { Model } from "model/Model";
import { useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import {
    calculateNominalDiscountRate,
    calculateNominalPercentage,
    calculateRealDiscountRate,
    percentFormatter,
    toDecimal,
    toPercentage,
} from "util/Util";

/**
 * Renders the value for the rate of change or unit rate of chang as a percent.
 * @param info
 */
function renderCell(info: RenderCellProps<RateChangeInfo>) {
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();
    const inflation = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;

    const rate = isDollarMethodCurrent ? calculateNominalDiscountRate(info.row.rate, inflation) : info.row.rate;

    return percentFormatter.format(rate);
}

/**
 * Renders an input for the rate of change or unit rate of change as a percent.
 * @param info
 */
function renderEditCell({ row, column, onRowChange }: RenderEditCellProps<RateChangeInfo>) {
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();
    const inflation = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;

    const rate = isDollarMethodCurrent ? calculateNominalDiscountRate(row.rate, inflation) : row.rate;

    return (
        <input
            className={"w-full pl-4"}
            type={"number"}
            defaultValue={toPercentage(rate)}
            onChange={(event) =>
                onRowChange({
                    ...row,
                    [column.key]: calculateRealDiscountRate(
                        toDecimal(Number.parseFloat(event.currentTarget.value)),
                        inflation,
                    ),
                })
            }
        />
    );
}

/**
 * Creates the column definitions for the value and unit data grids.
 * @param name The name of the rate change column.
 */
function createDataGridColumns(name: string) {
    return [
        {
            name: "Year",
            key: "year",
        },
        {
            name,
            key: "rate",
            editable: true,
            renderEditCell,
            renderCell,
        },
    ];
}

/**
 * A component that allows the user to input recurring costs. It displays a
 * checkbox that toggles the input form, and a form that allows the user to
 * input the rate of recurrence and the rate of change for the value and unit
 * costs.
 *
 * @param showValue If true, will show the value rate of change input.
 */
export default function Recurring() {
    return (
        <div className="my-4">
            <Title level={5}>
                <Info text={Strings.RECURRING}>Recurring</Info>
            </Title>
            <Switch
                checkedChildren={"Yes"}
                unCheckedChildren={"No"}
                checked={RecurringModel.isRecurring()}
                onChange={(toggle) => RecurringModel.Actions.toggleRecurring(toggle)}
            />
            {RecurringModel.isRecurring() && (
                <div className={"my-4 grid grid-cols-2 gap-x-16 gap-y-4"}>
                    <RateOfRecurrenceInput />
                </div>
            )}
        </div>
    );
}

type RateOfRecurrenceInputProps = {
    showLabel?: boolean;
};

export function RateOfRecurrenceInput({ showLabel = false }: RateOfRecurrenceInputProps) {
    return (
        <TestNumberInput
            className={"w-full"}
            label={showLabel ? "Rate of Recurrence" : undefined}
            addonBefore={"occurs every"}
            addonAfter={"years"}
            getter={RecurringModel.rateOfRecurrence.use}
            onChange={RecurringModel.Actions.setRateOfRecurrence}
        />
    );
}

export function ValueRateOfChange() {
    const isConstant = RecurringModel.Value.isConstant();

    return (
        <div>
            <Info text={Strings.VALUE_RATE_OF_CHANGE_INFO}>
                <Tooltip title={Strings.VALUE_RATE_OF_CHANGE_TOOLTIP}>
                    <Title level={5}>Value Rate of Change</Title>
                </Tooltip>
            </Info>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"pb-1 text-md"}>Constant</p>
                <Switch
                    checkedChildren={"Yes"}
                    unCheckedChildren={"No"}
                    checked={isConstant}
                    onChange={RecurringModel.Value.Actions.toggle}
                />
            </span>
            {(isConstant && <ValueRateOfChangeInput />) || <ValueRateOfChangeGrid />}
        </div>
    );
}

function ValueRateOfChangeGrid() {
    const columns = useMemo(() => createDataGridColumns("Value Rate of Change"), []);

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"rdg-light"}
                columns={columns}
                rows={RecurringModel.Value.gridValues()}
                onRowsChange={RecurringModel.Value.Actions.setArray}
            />
        </div>
    );
}

function ValueRateOfChangeInput() {
    const inflationRate = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();

    return (
        <div>
            <TestNumberInput
                id={"value-rate-of-change"}
                className={"w-full"}
                getter={() =>
                    calculateNominalPercentage(
                        (RecurringModel.Value.rate.use() as number) ?? 0,
                        inflationRate,
                        isDollarMethodCurrent,
                    )
                }
                onChange={(v) => RecurringModel.Value.Actions.setConstant(v, inflationRate, isDollarMethodCurrent)} // Input is in percentage
                addonAfter={"%"}
            />
        </div>
    );
}

export function UnitRateOfChange() {
    const isConstant = RecurringModel.Units.isConstant();

    return (
        <div>
            <Title level={5}>
                <Info text={Strings.UNIT_RATE_OF_CHANGE}>Unit Rate of Change</Info>
            </Title>
            <span className={"flex flex-row items-center gap-2 pb-2"}>
                <p className={"pb-1 text-md"}>Constant</p>
                <Switch
                    checked={isConstant}
                    checkedChildren={"Yes"}
                    unCheckedChildren={"No"}
                    onChange={RecurringModel.Units.Actions.toggle}
                />
            </span>
            {(isConstant && <UnitRateOfChangeInput />) || <UnitRateOfChangeGrid />}
        </div>
    );
}

function UnitRateOfChangeGrid() {
    const columns = useMemo(() => createDataGridColumns("Unit Rate of Change"), []);

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"rdg-light"}
                columns={columns}
                rows={RecurringModel.Units.gridValues()}
                onRowsChange={RecurringModel.Units.Actions.setArray}
            />
        </div>
    );
}

function UnitRateOfChangeInput() {
    return (
        <div>
            <TestNumberInput
                className={"w-full"}
                getter={() => +toPercentage((RecurringModel.Units.rate.use() as number) ?? 0).toFixed(2)}
                onChange={RecurringModel.Units.Actions.setConstant}
                addonAfter={"%"}
            />
        </div>
    );
}
