import { Select } from "antd";
import Title from "antd/es/typography/Title";
import Recurring from "components/Recurring";
import SelectOrCreate from "components/SelectOrCreate";
import { TestNumberInput } from "components/input/TestNumberInput";
import { OtherCostModel } from "model/costs/OtherCostModel";

export default function OtherNonMonetaryCostFields() {
    const allTags = OtherCostModel.useAllTags();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div>
                    <Title level={5}>{"Tags"}</Title>
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
                    getter={OtherCostModel.initialOccurrence.use}
                    onChange={OtherCostModel.Actions.setInitialOccurrence}
                />
                <TestNumberInput
                    className={"w-full"}
                    label={"Number of Units"}
                    getter={OtherCostModel.numberOfUnits.use}
                    onChange={OtherCostModel.Actions.setNumberOfUnits}
                    addonAfter={<SelectOrCreate placeholder={"Select Unit"} />}
                />

                <span className={"col-span-2"}>
                    <Recurring />
                </span>
            </div>
        </div>
    );
}
