import { useState } from "react";

import { Divider, Switch, Typography, Modal, Checkbox, Col, Row } from "antd";
import button, { ButtonType } from "../../components/Button";

import Icon from "@mdi/react";
import { mdiPlus, mdiContentCopy, mdiMinus } from "@mdi/js";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { Model } from "../../model/Model";

import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import table from "../../components/Table";
import dropdown from "../../components/Dropdown";

import { of } from "rxjs";

const { component: AddAlternative } = button();
const { component: Clone } = button();
const { component: Remove } = button();
const { click$: openModal$, component: AddCost } = button();

const { component: NameInput } = textInput();
const { component: DescInput } = textArea();
const { component: NewCostInput } = textInput();

const { Title } = Typography;

const dataSource = [
    {
        key: "1",
        costs: "Cost 1"
    },
    {
        key: "2",
        costs: "Cost 2"
    }
];
const { component: EnergyCosts } = table(of(dataSource));
const { component: WaterCosts } = table(of(dataSource));
const { component: CapitalCosts } = table(of(dataSource));
const { component: ContractCosts } = table(of(dataSource));
const { component: OtherCosts } = table(of(dataSource));

const costs = [
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

const { component: CostCategoryDropdown } = dropdown(costs);

export default function Alternatives() {
    const [open, setOpen] = useState(false);
    const plainOptions = Model.useAlternatives();

    useSubscribe(openModal$, () => setOpen(true));

    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setOpen(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setOpen(false);
    };

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
                                {plainOptions.length
                                    ? plainOptions.map((option) => (
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
                <EnergyCosts
                    columns={[
                        {
                            title: "Energy Costs",
                            dataIndex: "costs",
                            key: "column1",
                            editable: false
                        }
                    ]}
                />
                <WaterCosts
                    columns={[
                        {
                            title: "Water Costs",
                            dataIndex: "costs",
                            key: "column1",
                            editable: false
                        }
                    ]}
                />
                <CapitalCosts
                    columns={[
                        {
                            title: "Capital Costs",
                            dataIndex: "costs",
                            key: "column1",
                            editable: false
                        }
                    ]}
                />
                <ContractCosts
                    columns={[
                        {
                            title: "Contract Costs",
                            dataIndex: "costs",
                            key: "column1",
                            editable: false
                        }
                    ]}
                />
                <OtherCosts
                    columns={[
                        {
                            title: "Other Costs",
                            dataIndex: "costs",
                            key: "column1",
                            editable: false
                        }
                    ]}
                />
                <div />
            </div>
        </div>
    );
}
