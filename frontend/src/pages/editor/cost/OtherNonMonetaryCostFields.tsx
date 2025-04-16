import { Select, Tooltip } from "antd";
import Title from "antd/es/typography/Title";
import Recurring, { UnitRateOfChange } from "components/Recurring";
import SelectOrCreate from "components/SelectOrCreate";
import { TestNumberInput } from "components/input/TestNumberInput";
import { OtherCostModel } from "model/costs/OtherCostModel";
import { Strings } from "../../../constants/Strings";
import Info from "components/Info";
import { Model } from "model/Model";

export default function OtherNonMonetaryCostFields() {
    const allTags = OtherCostModel.useAllTags();
    const initialOccurenceWarning =
        OtherCostModel.initialOccurrence.use() > (Model.studyPeriod.use() ?? 0) + Model.constructionPeriod.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div>
                    <Info text={Strings.TAGS_INFO}>
                        <Tooltip title={Strings.TAGS_TOOLTIP}>
                            <Title level={5}>{"Tags"}</Title>
                        </Tooltip>
                    </Info>
                    <Select
                        className={"w-full"}
                        mode={"tags"}
                        options={allTags}
                        onChange={(tags) => OtherCostModel.tags.set(tags)}
                        value={OtherCostModel.tags.use()}
                    />
                </div>
                <TestNumberInput
                    className={"w-full"}
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    addonAfter={"years"}
                    getter={OtherCostModel.initialOccurrence.use}
                    onChange={OtherCostModel.Actions.setInitialOccurrence}
                    error={OtherCostModel.initialOccurrence.useValidation}
                    warning={initialOccurenceWarning ? "Warning: exceeds study period" : undefined}
                />
                <TestNumberInput
                    className={"w-full"}
                    label={"Number of Units"}
                    getter={OtherCostModel.numberOfUnits.use}
                    onChange={OtherCostModel.Actions.setNumberOfUnits}
                    addonAfter={<SelectOrCreate placeholder={"Select Unit"} />}
                    tooltip={Strings.NUMBER_OF_UNITS_TOOLTIP}
                    info={Strings.NUMBER_OF_UNITS_INFO}
                />
                <UnitRateOfChange />

                <span className={"col-span-2"}>
                    <Recurring showValue={false} />
                </span>
            </div>
        </div>
    );
}
