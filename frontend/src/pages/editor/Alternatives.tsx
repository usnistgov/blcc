import { useState } from "react";
import { Cost, CostTypes } from "../../blcc-format/Format";

import { Checkbox, Col, Divider, Modal, Row, Switch, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";

import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { Model } from "../../model/Model";

import dropdown from "../../components/Dropdown";
import table from "../../components/Table";
import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";

import { of } from "rxjs";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";

const { component: AddAlternative } = button();
const { component: Clone } = button();
const { component: Remove } = button();
const { click$: openModal$, component: AddCost } = button();

const { component: NameInput } = textInput(Model.name$);
const { component: DescInput } = textArea(Model.description$);
const { component: NewCostInput } = textInput();

const { Title } = Typography;

const columns = (costType: string) => {
    return [
        {
            title: `${costType} Costs`,
            dataIndex: "name",
            key: "column1",
            editable: false
        }
    ];
};

const costList = [
    "Capital Cost",
    "Energy Cost",
    "Water Cost",
    "Replacement Capital Cost",
    "OMR Cost",
    "Implementation Contract Cost",
    "Recurring Contract Cost",
    "Other Cost",
    "Other Non Monetary"
];

const { component: CostCategoryDropdown } = dropdown(costList);

export default function Alternatives() {
    // get the index of the alternative from url
    const altIndex = 1;

    const [open, setOpen] = useState(false);
    const alts = Model.useAlternatives();
    const costs = Model.useCosts();
    const altCosts: Cost[] = [];
    alts[altIndex]?.costs?.forEach((a) => altCosts?.push(costs[a]));

    useSubscribe(openModal$, () => setOpen(true));

    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setOpen(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setOpen(false);
    };

    const waterCosts = altCosts.filter(isWaterCost);
    const energyCosts = altCosts.filter(isEnergyCost);
    const capitalCosts = altCosts.filter(isCapitalCost);
    const contractCosts = altCosts.filter(isContractCost);
    const otherCosts = altCosts.filter(isOtherCost);

    const { component: EnergyCosts } = table(of(energyCosts));
    const { component: WaterCosts } = table(of(waterCosts));
    const { component: CapitalCosts } = table(of(capitalCosts));
    const { component: ContractCosts } = table(of(contractCosts));
    const { component: OtherCosts } = table(of(otherCosts));

    return (
        <div className="w-full h-full bg-white p-3">
            <div className={"float-right"}>
                <AddAlternative type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Alternative
                </AddAlternative>
                <Clone type={ButtonType.LINK}>
                    <Icon path={mdiContentCopy} size={1} /> Clone
                </Clone>
                <Remove type={ButtonType.LINKERROR}>
                    <Icon path={mdiMinus} size={1} /> Remove
                </Remove>
            </div>
            <Divider />

            <div className="flex">
                <div className="w-1/2">
                    <div className="w-1/2">
                        <Title level={5}>Name</Title>
                        <NameInput type={TextInputType.PRIMARY} />
                    </div>
                    <div className="w-1/2">
                        <Title level={5}>Description</Title>
                        <DescInput />
                    </div>
                </div>
                <span className="w-1/2">
                    <Title level={5}>Baseline Alternative</Title>
                    <Switch defaultChecked />
                    <p>Only one alternative can be the baseline.</p>
                </span>
            </div>
            <br />
            <div className="flex justify-between">
                <Title level={4}>Alternative Costs</Title>
                <AddCost type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Cost
                </AddCost>
                <Modal
                    title="Add New Cost"
                    open={open}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okButtonProps={{ disabled: false }}
                    cancelButtonProps={{ disabled: false }}
                >
                    <div>
                        <Title level={5}>Name</Title>
                        <NewCostInput type={TextInputType.PRIMARY} />
                    </div>
                    <br />
                    <div className="w-full">
                        <Title level={5}>Add to Alternatives</Title>
                        <Checkbox.Group style={{ width: "100%" }}>
                            <Row>
                                {alts.length
                                    ? alts.map((option) => (
                                          <Col span={16}>
                                              <Checkbox value={option} key={option}>
                                                  {option}
                                              </Checkbox>
                                          </Col>
                                      ))
                                    : "No Alternatives"}
                            </Row>
                        </Checkbox.Group>
                    </div>
                    <br />
                    <div>
                        <Title level={5}>Cost Category</Title>
                        <CostCategoryDropdown className="w-full" />
                    </div>
                </Modal>
            </div>
            <Divider className="m-0 mb-4" />
            <div className="flex justify-between" style={{ alignContent: "space-between" }}>
                <EnergyCosts pagination={false} columns={columns("Energy")} />
                <WaterCosts pagination={false} columns={columns("Water")} />
                <CapitalCosts pagination={false} columns={columns("Capital")} />
                <ContractCosts pagination={false} columns={columns("Contract")} />
                <OtherCosts pagination={false} columns={columns("Other")} />
                <div />
            </div>
        </div>
    );
}
