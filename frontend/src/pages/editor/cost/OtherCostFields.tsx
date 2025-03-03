import { Select } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import Recurring from "components/Recurring";
import SelectOrCreate from "components/SelectOrCreate";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { OtherCostModel } from "model/costs/OtherCostModel";

export default function OtherCostFields() {
    const allTags = OtherCostModel.useAllTags();
    const isSavings = CostModel.costOrSavings.use();
    const unit = OtherCostModel.unit.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div>
                    <Title level={5}>
                        <Info text={Strings.TAGS_INFO}>Tags</Info>
                    </Title>
                    {/* The following code hides the "Other" tag from the user */}
                    <Select
                        className={"w-full"}
                        mode={"tags"}
                        options={allTags?.filter((value) => value.label !== "Other")}
                        onChange={(tags) => OtherCostModel.tags.set(tags)}
                        value={(OtherCostModel.tags.use() ?? []).filter((tag) => tag !== "Other")}
                    />
                </div>
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_OCCURRENCE_AFTER_SERVICE}
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    addonAfter={"years"}
                    getter={OtherCostModel.initialOccurrence.use}
                    onChange={OtherCostModel.Actions.setInitialOccurrence}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.NUMBER_OF_UNITS_INFO}
                    label={"Number of Units"}
                    getter={OtherCostModel.numberOfUnits.use}
                    onChange={OtherCostModel.Actions.setNumberOfUnits}
                    addonAfter={<SelectOrCreate placeholder={"Select Unit"} />}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.UNIT_VALUE_INFO}
                    label={isSavings ? "Unit Value Benefits" : "Unit Value"}
                    addonBefore={"$"}
                    addonAfter={unit === undefined ? undefined : `per ${unit}`}
                    getter={OtherCostModel.valuePerUnit.use}
                    onChange={OtherCostModel.Actions.setValuePerUnit}
                    tooltip={Strings.UNIT_VALUE_TOOLTIP}
                />
                <span className={"col-span-2"}>
                    <Recurring showValue />
                </span>
            </div>
        </div>
    );
}
