import { useStateObservable } from "@react-rxjs/core";
import { Select } from "antd";
import Title from "antd/es/typography/Title";
import Recurring from "components/Recurring";
import { NumberInput } from "components/input/InputNumber";
import TextInput, { TextInputType } from "components/input/TextInput";
import { OtherCostModel } from "model/costs/OtherCostModel";
import { OtherNonMonetaryCostModel } from "model/costs/OtherNonMonetaryCostModel";
import { EMPTY, Subject } from "rxjs";
import SelectOrCreate from "../../../components/SelectOrCreate";

export default function OtherNonMonetaryCostFields() {
    const tags = useStateObservable(OtherNonMonetaryCostModel.tags$);
    const allTags = useStateObservable(OtherCostModel.allTags$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div>
                    <Title level={5}>{"Tags"}</Title>
                    <Select
                        className={"w-full"}
                        mode={"tags"}
                        options={allTags}
                        onChange={(tags) => OtherNonMonetaryCostModel.sTags$.next(tags)}
                        value={tags}
                    />
                </div>
                <NumberInput
                    className={"w-full"}
                    label={"Initial Occurrence"}
                    value$={OtherNonMonetaryCostModel.initialOccurrence$}
                    wire={OtherNonMonetaryCostModel.sInitialOccurrence$}
                />
                <NumberInput
                    className={"w-full"}
                    label={"Number of Units"}
                    value$={OtherNonMonetaryCostModel.numberOfUnits$}
                    wire={OtherNonMonetaryCostModel.sNumberOfUnits$}
                    addonAfter={
                        <SelectOrCreate
                            value$={OtherNonMonetaryCostModel.unit$}
                            wire$={OtherNonMonetaryCostModel.sUnit$}
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
