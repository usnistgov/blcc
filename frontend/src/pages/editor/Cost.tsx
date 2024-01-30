import { combineLatest, map, merge } from "rxjs";
import { CostTypes } from "../../blcc-format/Format";
import button, { ButtonType } from "../../components/Button";
import { mdiArrowLeft, mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { Checkbox, Col, Row, Typography } from "antd";
import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import { bind } from "@react-rxjs/core";
import React from "react";
import EnergyCostFields from "./cost/EnergyCostFields";
import { cost$, costType$ } from "../../model/Cost";
import { Model } from "../../model/Model";
import { createSignal, mergeWithKey } from "@react-rxjs/utils";
import WaterCostFields from "./cost/WaterCostFields";
import InvestmentCapitalCostFields from "./cost/InvestmentCapitalCostFields";
import ReplacementCapitalCostFields from "./cost/ReplacementCapitalCostFields";
import OMRCostFields from "./cost/OMRCostFields";
import ImplementationContractCostFields from "./cost/ImplementationContractCostFields";
import RecurringContractCostFields from "./cost/RecurringContractCostFields";
import OtherCostFields from "./cost/OtherCostFields";
import OtherNonMonetaryCostFields from "./cost/OtherNonMonetaryCostFields";
import { useAltName } from "../../model/AlternativeModel";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../../hooks/UseSubscribe";

const { Title } = Typography;
const [checkedAlts$, setCheckedAlts] = createSignal<number[]>();
const { component: BackButton, click$: backClick$ } = button();

const costFieldComponents = {
    [CostTypes.ENERGY]: () => <EnergyCostFields />,
    [CostTypes.WATER]: () => <WaterCostFields />,
    [CostTypes.CAPITAL]: () => <InvestmentCapitalCostFields />,
    [CostTypes.REPLACEMENT_CAPITAL]: () => <ReplacementCapitalCostFields />,
    [CostTypes.OMR]: () => <OMRCostFields />,
    [CostTypes.IMPLEMENTATION_CONTRACT]: () => <ImplementationContractCostFields />,
    [CostTypes.RECURRING_CONTRACT]: () => <RecurringContractCostFields />,
    [CostTypes.OTHER]: () => <OtherCostFields />,
    [CostTypes.OTHER_NON_MONETARY]: () => <OtherNonMonetaryCostFields />
};

const [fieldComponent] = bind(costType$.pipe(map((type) => costFieldComponents[type]())), undefined);

const { component: AddCostButton } = button();
const { component: CloneCostButton } = button();
const { component: RemoveCostButton } = button();
const { component: NameInput, onChange$: nameChange$ } = textInput(cost$.pipe(map((cost) => cost.name)));
const { component: DescriptionInput, onChange$: descriptionChange$ } = textArea(
    cost$.pipe(map((cost) => cost.description))
);

export const baseCostChange$ = mergeWithKey({
    name: nameChange$,
    description: descriptionChange$,
    alts: checkedAlts$
});

baseCostChange$.subscribe(console.log);

export default function Cost() {
    const alternativeName = useAltName();
    const navigate = useNavigate();

    useSubscribe(backClick$, () => navigate(-1));

    return (
        <div className={"w-full"}>
            <div className="add-alternative mt-2 flex flex-col border-b border-base-lighter pb-2">
                <div className="flex justify-between">
                    <div>
                        <BackButton type={ButtonType.LINK} icon={mdiArrowLeft}>
                            {alternativeName}
                        </BackButton>
                    </div>
                    <div>
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
                </div>
            </div>

            <div className={"max-w-screen-lg p-6"}>
                <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                    <NameInput type={TextInputType.PRIMARY} label={"Name"} />
                    <div>
                        <Title level={5}>Alternatives applied to</Title>
                        <Checkbox.Group
                            style={{ width: "100%" }}
                            onChange={(values) => setCheckedAlts(values as number[])}
                        >
                            <Row>
                                {Model.useAlternatives().map((alt) => (
                                    <Col span={16} key={alt.id}>
                                        <Checkbox value={alt.id}>{alt.name}</Checkbox>
                                    </Col>
                                )) || "No Alternatives"}
                            </Row>
                        </Checkbox.Group>
                    </div>
                    <span className={"col-span-2"}>
                        <DescriptionInput label={"Description"} className={"w-full"} />
                    </span>
                </div>
            </div>
            <div className={"border-t border-base-lighter"}>{fieldComponent()}</div>
        </div>
    );
}
