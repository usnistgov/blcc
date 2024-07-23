import { useStateObservable } from "@react-rxjs/core";
import { Select } from "antd";
import Title from "antd/es/typography/Title";
import Recurring from "components/Recurring";
import SelectOrCreate from "components/SelectOrCreate";
import { NumberInput } from "components/input/InputNumber";
import TextInput, { TextInputType } from "components/input/TextInput";
import { OtherCostModel } from "model/costs/OtherCostModel";
import { Subject } from "rxjs";

export default function OtherCostFields() {
    const tags = useStateObservable(OtherCostModel.tags$);
    const allTags = useStateObservable(OtherCostModel.allTags$);
    const unit = useStateObservable(OtherCostModel.unit$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div>
                    <Title level={5}>{"Tags"}</Title>
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
                    label={"Initial Occurrence"}
                    value$={OtherCostModel.initialOccurrence$}
                    wire={OtherCostModel.sInitialOccurrence$}
                />
                <NumberInput
                    className={"w-full"}
                    label={"Unit Value"}
                    addonAfter={`per ${unit}`}
                    value$={OtherCostModel.valuePerUnit$}
                    wire={OtherCostModel.sValuePerUnit$}
                />
                <NumberInput
                    className={"w-full"}
                    label={"Number of Units"}
                    value$={OtherCostModel.numberOfUnits$}
                    wire={OtherCostModel.sNumberOfUnits$}
                    addonAfter={
                        <SelectOrCreate
                            value$={OtherCostModel.unit$}
                            wire$={OtherCostModel.sUnit$}
                            options$={OtherCostModel.allUnits$}
                        />
                    }
                />
                <span className={"col-span-2"}>
                    <Recurring />
                </span>
            </div>
        </div>
    );
}
