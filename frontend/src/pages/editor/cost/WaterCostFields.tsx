import { useStateObservable } from "@react-rxjs/core";
import { InputNumber, Radio } from "antd";
import Title from "antd/es/typography/Title";
import { CubicUnit, LiquidUnit, type WaterUnit } from "blcc-format/Format";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import { WaterCostModel } from "model/costs/WaterCostModel";
import UsageIndex from "pages/editor/cost/energycostfields/UsageIndex";
import { Fragment, useMemo } from "react";
import { EMPTY, Subject } from "rxjs";
import { Strings } from "constants/Strings";
import Info from "components/Info";

export default function WaterCostFields() {
    const unitOptions: WaterUnit[] = useMemo(() => [...Object.values(LiquidUnit), ...Object.values(CubicUnit)], []);
    const unit = useStateObservable(WaterCostModel.unit$);
    const seasonNum = useStateObservable(WaterCostModel.usageSeasonNum$);
    const disposalNum = useStateObservable(WaterCostModel.disposalSeasonNum$);
    const usage = useStateObservable(WaterCostModel.usage$);
    const disposal = useStateObservable(WaterCostModel.disposal$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <Dropdown
                    className={"w-full"}
                    label={"Unit"}
                    info={Strings.UNIT}
                    options={unitOptions}
                    value$={WaterCostModel.unit$}
                    wire={WaterCostModel.sUnit$}
                />
                <div />

                <div>
                    <Title level={5}>
                        <Info text={Strings.USAGE}>Usage</Info>
                    </Title>
                    <Radio.Group
                        options={Object.values(WaterCostModel.SeasonOption)}
                        onChange={({ target: { value } }) => WaterCostModel.sUsageSeasonNum$.next(value)}
                        value={seasonNum}
                        buttonStyle={"solid"}
                        optionType={"button"}
                    />
                    <div className={"grid grid-cols-[auto,_1fr,_1fr] pt-4 gap-y-2"}>
                        {usage.map((season, i) => (
                            <Fragment key={season.season}>
                                <p className={"pr-4"}>{season.season}</p>
                                <InputNumber
                                    className={"w-full pr-4"}
                                    value={season.amount}
                                    onChange={(value) => {
                                        if (value === null) return;

                                        WaterCostModel.sUsageAmount$.next([i, value as number]);
                                    }}
                                    addonAfter={unit}
                                />
                                <InputNumber
                                    className={"w-full"}
                                    value={season.costPerUnit}
                                    onChange={(value) => {
                                        if (value === null) return;

                                        WaterCostModel.sUsageCost$.next([i, value as number]);
                                    }}
                                    addonAfter={`$/${unit}`}
                                />
                            </Fragment>
                        ))}
                    </div>
                </div>

                <div>
                    <Title level={5}>
                        <Info text={Strings.DISPOSAL}>Disposal</Info>
                    </Title>
                    <Radio.Group
                        options={Object.values(WaterCostModel.SeasonOption)}
                        onChange={({ target: { value } }) => WaterCostModel.sDisposalSeasonNum$.next(value)}
                        value={disposalNum}
                        buttonStyle={"solid"}
                        optionType={"button"}
                    />
                    <div className={"grid grid-cols-[auto,_1fr,_1fr] pt-4 gap-y-2"}>
                        {disposal.map((season, i) => (
                            <Fragment key={season.season}>
                                <p className={"pr-4"}>{season.season}</p>
                                <InputNumber
                                    className={"w-full pr-4"}
                                    value={season.amount}
                                    onChange={(value) => {
                                        if (value === null) return;
                                        WaterCostModel.sDisposalAmount$.next([i, value as number]);
                                    }}
                                    addonAfter={unit}
                                />
                                <InputNumber
                                    className={"w-full"}
                                    value={season.costPerUnit}
                                    onChange={(value) => {
                                        if (value === null) return;
                                        WaterCostModel.sDisposalCost$.next([i, value as number]);
                                    }}
                                    addonAfter={`$/${unit}`}
                                />
                            </Fragment>
                        ))}
                    </div>
                </div>
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}
