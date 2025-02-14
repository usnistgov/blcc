import { useStateObservable } from "@react-rxjs/core";
import { Select } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import Recurring from "components/Recurring";
import SelectOrCreate from "components/SelectOrCreate";
import { NumberInput } from "components/input/InputNumber";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { OtherCostModel } from "model/costs/OtherCostModel";

export default function OtherCostFields() {
    const tags = useStateObservable(OtherCostModel.tags$);
    const allTags = useStateObservable(OtherCostModel.allTags$);
    const unit = useStateObservable(OtherCostModel.unit$);
    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div>
                    <Title level={5}>
                        <Info text={Strings.TAGS}>Tags</Info>
                    </Title>
                    <Select
                        className={"w-full"}
                        mode={"tags"}
                        options={allTags}
                        onChange={(tags) => OtherCostModel.sTags$.next(tags)}
                        value={tags}
                    />
                </div>
                <NumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_OCCURRENCE}
                    label={"Initial Occurrence"}
                    value$={OtherCostModel.initialOccurrence$}
                    wire={OtherCostModel.sInitialOccurrence$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.NUMBER_OF_UNITS}
                    label={"Number of Units"}
                    value$={OtherCostModel.numberOfUnits$}
                    wire={OtherCostModel.sNumberOfUnits$}
                    addonAfter={
                        <SelectOrCreate
                            placeholder={"Select Unit"}
                            value$={OtherCostModel.unit$}
                            wire$={OtherCostModel.sUnit$}
                            options$={OtherCostModel.allUnits$}
                        />
                    }
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.UNIT_VALUE}
                    label={isSavings ? "Unit Value Benefits" : "Unit Value"}
                    addonBefore={"$"}
                    addonAfter={unit === undefined ? undefined : `per ${unit}`}
                    value$={OtherCostModel.valuePerUnit$}
                    wire={OtherCostModel.sValuePerUnit$}
                />
                <span className={"col-span-2"}>
                    <Recurring showUnit />
                </span>
            </div>
        </div>
    );
}
