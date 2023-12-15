import { urlParameters$ } from "../../components/UrlParameters";
import { combineLatestWith } from "rxjs/operators";
import { combinedCostObject$ } from "./AlternativeSummary";
import { filter, map } from "rxjs";
import { Cost as CostType, CostTypes } from "../../blcc-format/Format";
import button, { ButtonType } from "../../components/Button";
import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { Divider } from "antd";
import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import { bind } from "@react-rxjs/core";
import React from "react";
import EnergyCostFields from "./cost/EnergyCostFields";

export const cost$ = urlParameters$.pipe(
    combineLatestWith(combinedCostObject$),
    map(([{ costID }, costs]) => costs.get(parseInt(costID ?? "-1"))),
    filter((cost): cost is CostType => cost !== undefined)
);
export const costType$ = cost$.pipe(map((cost) => cost.type));

const [fieldComponent] = bind(
    costType$.pipe(
        map((type) => {
            switch (type) {
                case CostTypes.ENERGY:
                    return <EnergyCostFields />;
                default:
                    return <div>Default</div>;
            }
        })
    ),
    undefined
);

const { component: AddCostButton } = button();
const { component: CloneCostButton } = button();
const { component: RemoveCostButton } = button();
const { component: NameInput } = textInput(cost$.pipe(map((cost) => cost.name)));
const { component: DescriptionInput } = textArea(cost$.pipe(map((cost) => cost.description)));

export default function Cost() {
    return (
        <div className={"w-full h-full"}>
            <div className="add-alternative flex flex-col">
                <div className="flex justify-end">
                    <AddCostButton type={ButtonType.LINK} icon={mdiPlus}>
                        Add Cost
                    </AddCostButton>
                    <CloneCostButton type={ButtonType.LINK} icon={mdiContentCopy}>
                        Clone
                    </CloneCostButton>
                    <RemoveCostButton type={ButtonType.LINKERROR} icon={mdiMinus}>
                        Remove
                    </RemoveCostButton>
                </div>

                <Divider className="p-0 m-0" />
            </div>

            <NameInput type={TextInputType.PRIMARY} label={"Name"} />
            <DescriptionInput label={"Description"} />
            <>{fieldComponent()}</>
        </div>
    );
}
