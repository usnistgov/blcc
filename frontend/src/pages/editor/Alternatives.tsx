import { createSignal } from "@react-rxjs/utils";
import { useEffect, useState } from "react";
import { Cost } from "../../blcc-format/Format";

import { Button, Checkbox, Col, Divider, Modal, Row, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";

import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import dropdown from "../../components/Dropdown";
import switchComp from "../../components/Switch";

import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { Model } from "../../model/Model";

import { useNavigate, useParams } from "react-router-dom";
import { Observable } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { getNewID, isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";

const { component: Clone } = button();
const { click$: removeAlternative$, component: Remove } = button();

const { click$: openAltModal$, component: AddAlternative } = button();
const { click$: addAlternative$, component: AddAlternativeBtn } = button();
const { click$: addCost$, component: AddCostBtn } = button();

const { click$: openCostModal$, component: AddCost } = button();
// const { click$: openCostModal$, component: AddCost } = button();
const { onChange$: baselineChange$, component: Switch } = switchComp();
const [altId$, setAltId] = createSignal();

const { Title } = Typography;

const { component: NameInput } = textInput(Model.name$);
const { component: DescInput } = textArea(Model.description$);
const { onChange$: addAltChange$, component: NewAltInput } = textInput();
const { onChange$: addCostChange$, component: NewCostInput } = textInput();

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

// const { onChange$: addCostType$, component: CostCategoryDropdown } = dropdown(costList);
const { change$: addCostType$, component: CostCategoryDropdown } = dropdown(Object.values(costList));

export const modifiedbaselineChange$: Observable<T> = baselineChange$.pipe(withLatestFrom(altId$));
export const modifiedremoveAlternative$: Observable<T> = removeAlternative$.pipe(withLatestFrom(altId$));

export const modifiedAddAlternative$ = addAlternative$.pipe(
    withLatestFrom(Model.alternatives$),
    withLatestFrom(addAltChange$),
    map(([alts, name]) => {
        const nextID = getNewID(alts[1]);
        return {
            id: nextID,
            name: name,
            costs: [],
            baseline: false
        };
    })
);

export default function Alternatives() {
    const navigate = useNavigate();
    // get the index of the alternative from url
    const { alternativeID } = useParams();

    useEffect(() => {
        if (alternativeID !== undefined) {
            setAltId(alternativeID);
        }
    }, [alternativeID]);

    const [openAddAlternative, setOpenAddAlternative] = useState(false);
    const [openAddCost, setOpenAddCost] = useState(false);

    const alts = Model.useAlternatives();
    const costs = Model.useCosts();
    const altCosts: Cost[] = [];

    alts[alternativeID]?.costs?.forEach((a) => altCosts?.push(costs[a]));

    useSubscribe(openCostModal$, () => setOpenAddCost(true));
    useSubscribe(openAltModal$, () => setOpenAddAlternative(true));
    useSubscribe(modifiedAddAlternative$, () => setOpenAddAlternative(false));

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

    const categories = [
        {
            label: "Energy Costs",
            children: energySubcategories
        },
        {
            label: "Water Costs",
            children: waterCosts
        },
        {
            label: "Capital Costs",
            children: capitalSubcategories
        },
        {
            label: "Contract Costs",
            children: contractSubcategories
        },
        {
            label: "Other Costs",
            children: otherSubcategories
        }
    ];

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
                    footer={[
                        <Button key="back" onClick={handleAltCancel}>
                            Return
                        </Button>,
                        <AddAlternativeBtn type={ButtonType.PRIMARY} key="add">
                            Add
                        </AddAlternativeBtn>
                    ]}
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
                    <Switch
                        className=""
                        checkedChildren=""
                        unCheckedChildren=""
                        defaultChecked={alts[alternativeID]?.baseline != undefined ? true : false}
                    />
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
                    footer={[
                        <Button key="back" onClick={handleAltCancel}>
                            Return
                        </Button>,
                        <AddCostBtn type={ButtonType.PRIMARY} key="add-cost-btn">
                            Add
                        </AddCostBtn>
                    ]}
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
                                                key={alternativeID - item?.id}
                                                className="overflow-hidden whitespace-nowrap text-ellipsis"
                                                onClick={() => navigate(`/editor/alternative/cost/${item?.id}`)}
                                            >
                                                {item?.name || "Unknown"}
                                            </li>
                                        ))
                                    ) : (
                                        <li
                                            className="overflow-hidden whitespace-nowrap text-ellipsis"
                                            key={alternativeID - obj?.name - obj?.id}
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
