import { map } from "rxjs";
import { CostTypes } from "../../blcc-format/Format";
import button, { ButtonType } from "../../components/Button";
import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { Checkbox, Col, Divider, Row, Typography } from "antd";
import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import { bind } from "@react-rxjs/core";
import React from "react";
import EnergyCostFields from "./cost/EnergyCostFields";
import { cost$, costType$ } from "../../model/Cost";
import { Model } from "../../model/Model";
import { createSignal } from "@react-rxjs/utils";
import WaterCostFields from "./cost/WaterCostFields";
import InvestmentCapitalCostFields from "./cost/InvestmentCapitalCostFields";
import ReplacementCapitalCostFields from "./cost/ReplacementCapitalCostFields";
import OMRCostFields from "./cost/OMRCostFields";
import ImplementationContractCostFields from "./cost/ImplementationContractCostFields";
import RecurringContractCostFields from "./cost/RecurringContractCostFields";
import OtherCostFields from "./cost/OtherCostFields";
import OtherNonMonetaryCostFields from "./cost/OtherNonMonetaryCostFields";

const { Title } = Typography;
const [checkedAlts$, setCheckedAlts] = createSignal<number[]>();

const [fieldComponent] = bind(
    costType$.pipe(
        map((type) => {
            switch (type) {
                case CostTypes.ENERGY:
                    return <EnergyCostFields />;
                case CostTypes.WATER:
                    return <WaterCostFields />;
                case CostTypes.CAPITAL:
                    return <InvestmentCapitalCostFields />;
                case CostTypes.REPLACEMENT_CAPITAL:
                    return <ReplacementCapitalCostFields />;
                case CostTypes.OMR:
                    return <OMRCostFields />;
                case CostTypes.IMPLEMENTATION_CONTRACT:
                    return <ImplementationContractCostFields />;
                case CostTypes.RECURRING_CONTRACT:
                    return <RecurringContractCostFields />;
                case CostTypes.OTHER:
                    return <OtherCostFields />;
                case CostTypes.OTHER_NON_MONETARY:
                    return <OtherNonMonetaryCostFields />;
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
        <div className={"w-full h-full px-8"}>
            <div className="add-alternative flex flex-col mt-2">
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

                <Divider className="p-0 mt-2" />
            </div>

            <div className={"flex flex-row justify-between py-8"}>
                <div>
                    <NameInput type={TextInputType.PRIMARY} label={"Name"} />
                    <DescriptionInput label={"Description"} />
                </div>
                <div>
                    <Title level={5}>Alternatives applied to</Title>
                    <Checkbox.Group style={{ width: "100%" }} onChange={(values) => setCheckedAlts(values as number[])}>
                        <Row>
                            {Model.useAlternatives().map((alt) => (
                                <Col span={16} key={alt.id}>
                                    <Checkbox value={alt.id}>{alt.name}</Checkbox>
                                </Col>
                            )) || "No Alternatives"}
                        </Row>
                    </Checkbox.Group>
                </div>
            </div>
            {fieldComponent()}
        </div>
    );
}
