import { useStateObservable } from "@react-rxjs/core";
import { Select } from "antd";
import Title from "antd/es/typography/Title";
import Recurring from "components/Recurring";
import { NumberInput } from "components/input/InputNumber";
import TextInput, { TextInputType } from "components/input/TextInput";
import { OtherCostModel } from "model/costs/OtherCostModel";
import { EMPTY, Subject } from "rxjs";

export default function OtherCostFields() {
    const tags = useStateObservable(OtherCostModel.tags$);
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
                        onChange={(tags) => OtherCostModel.sTags$.next(tags)}
                        value={tags}
                    />
                </div>
                <NumberInput className={"w-full"} label={"Initial Occurrence"} value$={EMPTY} />
                <TextInput className={"w-full"} label={"Unit Name"} type={TextInputType.PRIMARY} wire={new Subject()} />
                <NumberInput className={"w-full"} label={"Number of Units"} value$={EMPTY} />
                <Recurring />
            </div>
        </div>
    );
}
