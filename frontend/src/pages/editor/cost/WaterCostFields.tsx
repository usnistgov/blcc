import { bind } from "@react-rxjs/core";
import { InputNumber, Radio, Switch } from "antd";
import Title from "antd/es/typography/Title";
import { Defaults } from "blcc-format/Defaults";
import { CubicUnit, LiquidUnit, type WaterUnit } from "blcc-format/Format";
import Info from "components/Info";
import { TestNumberInput } from "components/input/TestNumberInput";
import { TestSelect } from "components/input/TestSelect";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { type EscalationRateInfo, EscalationRateModel, toEscalationRateInfo } from "model/EscalationRateModel";
import { Model } from "model/Model";
import { WaterCostModel } from "model/costs/WaterCostModel";
import UsageIndex from "pages/editor/cost/energycostfields/UsageIndex";
import { Fragment, useMemo } from "react";
import DataGrid from "react-data-grid";
import { map } from "rxjs";
import { combineLatestWith, filter, switchMap, withLatestFrom } from "rxjs/operators";
import { guard } from "util/Operators";
import { calculateNominalPercentage, calculateRealDecimal, makeArray, toDecimal, toPercentage } from "util/Util";
import { Var } from "util/var";

export default function WaterCostFields() {
    const unitOptions: WaterUnit[] = useMemo(() => [...Object.values(LiquidUnit), ...Object.values(CubicUnit)], []);
    const unit = WaterCostModel.unit.use();
    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TestSelect
                    className={"w-full"}
                    label={"Unit"}
                    info={Strings.UNIT}
                    options={unitOptions}
                    getter={WaterCostModel.unit.use}
                    onChange={WaterCostModel.Actions.setUnit}
                />
                <div />

                <div>
                    <Title level={5}>
                        <Info text={Strings.USAGE}>Usage {isSavings && "Savings"}</Info>
                    </Title>
                    <Radio.Group
                        options={Object.values(WaterCostModel.SeasonOption)}
                        onChange={WaterCostModel.Actions.toggleUsageSeasonNum}
                        value={WaterCostModel.useUsageSeasonNum()}
                        buttonStyle={"solid"}
                        optionType={"button"}
                    />
                    <div className={"grid grid-cols-[auto,_1fr,_1fr] gap-y-2 pt-4"}>
                        {WaterCostModel.usage.use().map((season, i) => (
                            <Fragment key={season.season}>
                                <p className={"pr-4"}>{season.season}</p>
                                <InputNumber
                                    className={"w-full pr-4"}
                                    value={season.amount}
                                    onChange={(value) => WaterCostModel.Actions.setUsageAmount(i, value)}
                                    addonAfter={unit}
                                />
                                <InputNumber
                                    className={"w-full"}
                                    value={season.costPerUnit}
                                    onChange={(value) => WaterCostModel.Actions.setUsageCost(i, value)}
                                    addonAfter={`$/${unit}`}
                                />
                            </Fragment>
                        ))}
                    </div>
                </div>

                <div>
                    <Title level={5}>
                        <Info text={Strings.DISPOSAL}>Disposal {isSavings && "Savings"}</Info>
                    </Title>
                    <Radio.Group
                        options={Object.values(WaterCostModel.SeasonOption)}
                        onChange={WaterCostModel.Actions.toggleDisposalSeasonNum}
                        value={WaterCostModel.useDisposalSeasonNum()}
                        buttonStyle={"solid"}
                        optionType={"button"}
                    />
                    <div className={"grid grid-cols-[auto,_1fr,_1fr] gap-y-2 pt-4"}>
                        {WaterCostModel.disposal.use().map((season, i) => (
                            <Fragment key={season.season}>
                                <p className={"pr-4"}>{season.season}</p>
                                <InputNumber
                                    className={"w-full pr-4"}
                                    value={season.amount}
                                    onChange={(value) => WaterCostModel.Actions.setDisposalAmount(i, value)}
                                    addonAfter={unit}
                                />
                                <InputNumber
                                    className={"w-full"}
                                    value={season.costPerUnit}
                                    onChange={(value) => WaterCostModel.Actions.setDisposalCost(i, value)}
                                    addonAfter={`$/${unit}`}
                                />
                            </Fragment>
                        ))}
                    </div>
                </div>

                <EscalationRates />
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}

namespace WaterEscalationModel {
    export const escalation = new Var(CostModel.cost, WaterCostModel.waterCostOptic.prop("escalation"));

    export const [useConstantPercent] = bind(
        escalation.$.pipe(
            guard(),
            filter((rate): rate is number => !Array.isArray(rate)),
            withLatestFrom(Model.inflationRate.$, Model.isDollarMethodCurrent$),
            map(([rate, inflationRate, isDollarMethodCurrent]) =>
                calculateNominalPercentage(rate, inflationRate ?? Defaults.INFLATION_RATE, isDollarMethodCurrent),
            ),
        ),
        undefined,
    );

    export const [isConstant] = bind(
        escalation.$.pipe(map((escalation) => escalation === undefined || !Array.isArray(escalation))),
    );

    const arrayRates$ = escalation.$.pipe(
        guard(),
        filter((rates) => Array.isArray(rates)),
    );

    const values$ = arrayRates$.pipe(
        switchMap((rates) => {
            if (rates.length > 0) return arrayRates$;

            // We are not using custom rates, and do not have a custom location, so use the project rates.
            return Model.studyPeriod.$.pipe(
                guard(),
                withLatestFrom(Model.constructionPeriod.$),
                map(([studyPeriod, constructionPeriod]) => makeArray(studyPeriod + constructionPeriod, 0)),
            );
        }),
    );

    export const [gridValues] = bind(values$.pipe(combineLatestWith(Model.releaseYear.$), map(toEscalationRateInfo)));

    export namespace Actions {
        export function toggleConstant(toggle: boolean) {
            if (toggle) {
                // Is Constant
                const rates = escalation.current();
                escalation.set((rates as number[])[0] ?? 0);
            } else {
                // Not Constant
                const studyPeriod = Model.studyPeriod.current() ?? 0;
                const constructionPeriod = Model.constructionPeriod.current();
                const rate = escalation.current();
                escalation.set(makeArray(studyPeriod + constructionPeriod, rate as number));
            }
        }

        export function setConstant(value: number | null, inflationRate: number, isDollarMethodCurrent: boolean) {
            if (value !== null) escalation.set(calculateRealDecimal(value, inflationRate, isDollarMethodCurrent));
        }

        export function setRates(rates: EscalationRateInfo[]) {
            const newRates = rates.map((rate) => rate.rate);
            escalation.set(newRates);
        }
    }
}

function EscalationRates() {
    const isConstant = WaterEscalationModel.isConstant();

    return (
        <div>
            <Title level={5}>Escalation Rates</Title>
            <div className={"flex flex-row justify-between pb-2"}>
                <span className={"flex flex-row items-center gap-2"}>
                    <p className={"pb-1 text-md"}>Constant</p>
                    <Switch
                        value={isConstant}
                        onChange={WaterEscalationModel.Actions.toggleConstant}
                        checkedChildren={"Yes"}
                        unCheckedChildren={"No"}
                    />
                </span>
                {isConstant && <EscalationInput />}
            </div>
            {!isConstant && <EscalationGrid />}
        </div>
    );
}

function EscalationInput() {
    const inflationRate = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();

    return (
        <div>
            <TestNumberInput
                className={"w-full"}
                getter={WaterEscalationModel.useConstantPercent}
                onChange={(val) => WaterEscalationModel.Actions.setConstant(val, inflationRate, isDollarMethodCurrent)}
                addonAfter={"%"}
            />
        </div>
    );
}

function EscalationGrid() {
    const inflationRate = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"rdg-light h-full"}
                rows={WaterEscalationModel.gridValues()}
                columns={EscalationRateModel.COLUMNS}
                onRowsChange={WaterEscalationModel.Actions.setRates}
            />
        </div>
    );
}
