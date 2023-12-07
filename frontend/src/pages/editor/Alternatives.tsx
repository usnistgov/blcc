import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Cost } from "../../blcc-format/Format";

import { Divider, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
const { Title } = Typography;

import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";

import AddAlternativeModal from "../../components/AddAlternativeModal";
import AddCostModal from "../../components/AddCostModal";
import switchComp from "../../components/Switch";
import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";

import { Model } from "../../model/Model";

import { useNavigate } from "react-router-dom";
import { Observable } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { getNewID, isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";

const { click$: cloneAlternative$, component: Clone } = button();
const { click$: removeAlternative$, component: Remove } = button();

const { click$: openAltModal$, component: AddAlternativeBtn } = button();

const { click$: openCostModal$, component: AddCostBtn } = button();
const { onChange$: baselineChange$, component: Switch } = switchComp();
const [altId$, setAltId] = createSignal();

const { component: NameInput } = textInput(Model.name$);
const { component: DescInput } = textArea(Model.description$);

import { siteId$ } from "../../components/URLParams";

export const modifiedbaselineChange$: Observable<T> = baselineChange$.pipe(withLatestFrom(altId$));
export const modifiedremoveAlternative$: Observable<T> = removeAlternative$.pipe(withLatestFrom(altId$));
export const modifiedcloneAlternative$: Observable<T> = cloneAlternative$.pipe(
    withLatestFrom(Model.alternatives$),
    withLatestFrom(altId$),
    map(([alts, altId]) => {
        const nextID = getNewID(alts[1]);
        return {
            id: nextID,
            altId
        };
    })
);

export const modifiedOpenAltModal$: Observable<T> = openAltModal$.pipe(map(() => true));
export const modifiedOpenCostModal$: Observable<T> = openCostModal$.pipe(map(() => true));

const { component: AddAlternatives } = AddAlternativeModal(modifiedOpenAltModal$);
const { component: AddCosts } = AddCostModal(modifiedOpenCostModal$);

const alternativeID = siteId$.pipe(
    map(({ alternativeID }) => (alternativeID ? +alternativeID : -1)),
    withLatestFrom(Model.alternatives$),
    map(([altId, alts]) => alts.find((a) => a.id === altId))
);

// just the single alternative
const [useAlt, alt$] = bind(alternativeID, undefined);

export default function Alternatives() {
    const navigate = useNavigate();

    const alts = Model.useAlternatives();
    const costs = Model.useCosts();
    const altCosts: Cost[] = [];

    const singleAlt = useAlt();
    singleAlt?.costs?.forEach((a) => altCosts?.push(costs[a]));
    setAltId(singleAlt?.id);

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
                <AddAlternativeBtn type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Alternative
                </AddAlternativeBtn>
                <AddAlternatives />
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
                        defaultChecked={alts[singleAlt?.id]?.baseline != undefined ? true : false}
                    />
                    <p>Only one alternative can be the baseline.</p>
                </span>
            </div>
            <br />
            <div className="flex justify-between">
                <Title level={4}>Alternative Costs</Title>
                <AddCostBtn type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Cost
                </AddCostBtn>
                <AddCosts />
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
                                        obj?.items?.map((item: Cost) => (
                                            <li
                                                key={singleAlt?.id - item?.id}
                                                className="overflow-hidden whitespace-nowrap text-ellipsis"
                                                onClick={() => navigate(`/editor/alternative/cost/${item?.id}`)}
                                            >
                                                {item?.name || "Unknown"}
                                            </li>
                                        ))
                                    ) : (
                                        <li
                                            className="overflow-hidden whitespace-nowrap text-ellipsis"
                                            key={singleAlt?.id - obj?.name - obj?.id}
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
