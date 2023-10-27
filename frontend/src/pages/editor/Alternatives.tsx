import { Divider, Switch, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
import Icon from "@mdi/react";
import { mdiPlus, mdiContentCopy, mdiMinus } from "@mdi/js";
import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import table from "../../components/Table";
import { of } from "rxjs";

const { component: AddAlternative } = button();
const { component: Clone } = button();
const { component: Remove } = button();
const { component: AddCost } = button();

const { component: NameInput } = textInput();
const { component: DescInput } = textArea();

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

export default function Alternatives() {
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
