import { useEffect, useState } from "react";
import { Cost, CostTypes, EnergyCost } from "../../blcc-format/Format";

import { Checkbox, Col, Divider, Modal, Row, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";

import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import dropdown from "../../components/Dropdown";
import switchComp from "../../components/Switch";
import table from "../../components/Table";
import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { Model } from "../../model/Model";
import { countProperty } from "../../util/Operators";

import { useNavigate, useParams } from "react-router-dom";
import { Observable, of } from "rxjs";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";

const { component: Clone } = button();
const { component: Remove } = button();
const { onChange$: baselineChange$, component: Switch } = switchComp();
const { click$: openAltModal$, component: AddAlternative } = button();
const { click$: openCostModal$, component: AddCost } = button();

const { Title } = Typography;

const { component: NameInput } = textInput(Model.name$);
const { component: DescInput } = textArea(Model.description$);
const { component: NewAltInput } = textInput();
const { component: NewCostInput } = textInput();

// const columns = (costType: string) => {
//     return [
//         {
//             title: `${costType} Costs`,
//             dataIndex: "name",
//             key: "name",
//             editable: false
//         }
//     ];
// };

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

export { baselineChange$ };

export default function Alternatives() {
    const navigate = useNavigate();
    const params = useParams();
    // get the index of the alternative from url
    const [altIndex, setAltIndex] = useState(params?.alternativeID);

    useEffect(() => {
        setAltIndex(params?.alternativeID);
    }, [params]);

    const [openAddAlternative, setOpenAddAlternative] = useState(false);
    const [openAddCost, setOpenAddCost] = useState(false);
    const alts = Model.useAlternatives();
    const costs = Model.useCosts();
    const altCosts: Cost[] = [];
    alts[altIndex]?.costs?.forEach((a) => altCosts?.push(costs[a]));

    useSubscribe(openCostModal$, () => setOpenAddCost(true));
    useSubscribe(openAltModal$, () => setOpenAddAlternative(true));

    const handleAltOk = () => {
        setOpenAddAlternative(false);
    };

    const handleCostOk = () => {
        setOpenAddCost(false);
    };

    const handleAltCancel = () => {
        setOpenAddAlternative(false);
    };

    const handleCostCancel = () => {
        setOpenAddCost(false);
    };

    const waterCosts = altCosts.filter(isWaterCost);
    const energyCosts = altCosts.filter(isEnergyCost);
    const capitalCosts = altCosts.filter(isCapitalCost);
    const contractCosts = altCosts.filter(isContractCost);
    const otherCosts = altCosts.filter(isOtherCost);

    const countProp = (arr, key: string) => {
        const res = {};
        arr.map((a) => {
            if (res?.[a?.[key]]) res?.[a?.[key]].push(a);
            else res[a?.[key]] = [a];
        });

        const result = Object.keys(res).map((key) => ({
            key,
            items: res[key]
        }));
        return result;
    };

    const energySubcategories = countProp(energyCosts, "fuelType");
    const capitalSubcategories = countProp(capitalCosts, "type");
    const contractSubcategories = countProp(contractCosts, "type");
    const otherSubcategories = countProp(otherCosts, "type");
    console.log(energySubcategories, capitalSubcategories, waterCosts);

    const categories = [
        {
            label: "Energy Costs",
            // hook: energyCosts
            children: energySubcategories
        },
        {
            label: "Water Costs",
            // hook: waterCosts,
            children: waterCosts
        },
        {
            label: "Capital Costs",
            // hook: capitalCosts
            children: capitalSubcategories
        },
        {
            label: "Contract Costs",
            // hook: contractCosts
            children: contractSubcategories
        },
        {
            label: "Other Costs",
            // hook: otherCosts
            children: otherSubcategories
        }
    ];

    // const { component: EnergyCosts } = table(of(energyCosts));
    // const { component: WaterCosts } = table(of(waterCosts));
    // const { component: CapitalCosts } = table(of(capitalCosts));
    // const { component: ContractCosts } = table(of(contractCosts));
    // const { component: OtherCosts } = table(of(otherCosts));

    return (
        <div className="w-full h-full bg-white p-3">
            <div className={"float-right"}>
                <AddAlternative type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Alternative
                </AddAlternative>
                <Modal
                    title="Add New Alternative"
                    open={openAddAlternative}
                    onOk={handleAltOk}
                    onCancel={handleAltCancel}
                    okButtonProps={{ disabled: false }}
                    cancelButtonProps={{ disabled: false }}
                >
                    <div>
                        <Title level={5}>Name</Title>
                        <NewAltInput type={TextInputType.PRIMARY} />
                    </div>
                    <p>Further changes can be made in the associated alternative page.</p>
                </Modal>
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
                    <Switch className="" checkedChildren="" unCheckedChildren="" defaultChecked />
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
                    open={openAddCost}
                    onOk={handleCostOk}
                    onCancel={handleCostCancel}
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
                                              <Checkbox value={option?.name} key={option?.id}>
                                                  {option?.name}
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
                {categories.map((category) => (
                    <div className="water-costs w-40" key={category.label}>
                        <div className=" flex justify-between">
                            <Title level={5}>{category.label}</Title>
                        </div>
                        <Divider className="m-0" />
                        {category?.children?.map((obj) => (
                            <div className="flex flex-col justify-between m-2 border">
                                <div className="border bg-primary text-center text-white">{obj?.key || ""}</div>
                                <ul className="hover:cursor-pointer">
                                    {obj?.items ? (
                                        obj?.items?.map((item) => (
                                            <li
                                                key={item?.id}
                                                className="overflow-hidden whitespace-nowrap text-ellipsis"
                                                onClick={() => navigate(`/editor/alternative/cost/${item?.id}`)}
                                            >
                                                {item?.name || "Unknown"}
                                            </li>
                                        ))
                                    ) : (
                                        <li
                                            className="overflow-hidden whitespace-nowrap text-ellipsis"
                                            key={obj?.name - obj?.id}
                                            onClick={() => navigate(`/editor/alternative/cost/${obj?.id}`)}
                                        >
                                            {obj?.name || "Unknown"}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))}
                <div />
            </div>
        </div>
    );
}
