import { InputNumber, Radio } from "antd";
import Title from "antd/es/typography/Title";
import { CubicUnit, LiquidUnit, type WaterUnit } from "blcc-format/Format";
import Info from "components/Info";
import { TestSelect } from "components/input/TestSelect";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { WaterCostModel } from "model/costs/WaterCostModel";
import EscalationRates from "pages/editor/cost/energycostfields/EscalationRates";
import UsageIndex from "pages/editor/cost/energycostfields/UsageIndex";
import { Fragment, useMemo } from "react";

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

                <EscalationRates title={"Escalation Rates"} />
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}
