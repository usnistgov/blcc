import { Alternative, Cost, CostTypes, FuelType } from "../../blcc-format/Format";
import { Divider, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { urlParameters$ } from "../../components/UrlParameters";
import addAlternativeModal from "../../components/AddAlternativeModal";
import addCostModal from "../../components/AddCostModal";
import switchComp from "../../components/Switch";
import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";
import { Model } from "../../model/Model";
import { useNavigate } from "react-router-dom";
import { map, withLatestFrom } from "rxjs/operators";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";
import { combineLatest, filter, sample } from "rxjs";
import { bind } from "@react-rxjs/core";
import { combinedCostObject$ } from "./AlternativeSummary";

const { Title } = Typography;

const alternativeID$ = urlParameters$.pipe(map(({ alternativeID }) => (alternativeID ? +alternativeID : -1)));
const alt$ = combineLatest([alternativeID$, Model.alternatives$]).pipe(
    map(([altId, alts]) => alts.find((a) => a.id === altId)),
    filter((alt): alt is Alternative => alt !== undefined)
);

const { click$: cloneAlternativeClick$, component: CloneButton } = button();
const { click$: removeAlternativeClick$, component: RemoveButton } = button();
const { click$: openAltModal$, component: AddAlternativeButton } = button();
const { click$: openCostModal$, component: AddCostButton } = button();
const { onChange$: baselineChange$, component: BaselineSwitch } = switchComp(
    alt$.pipe(map((alt) => alt?.baseline ?? false))
);
const { onChange$: name$, component: NameInput } = textInput(alt$.pipe(map((alt) => alt.name)));
const { component: DescInput } = textArea(alt$.pipe(map((alt) => alt.description)));

export const alternativeNameChange$ = name$.pipe(withLatestFrom(alternativeID$));
export const modifiedBaselineChange$ = baselineChange$.pipe(withLatestFrom(alternativeID$));
export const removeAlternative$ = alternativeID$.pipe(sample(removeAlternativeClick$));
export const cloneAlternative$ = alternativeID$.pipe(sample(cloneAlternativeClick$));

const { component: AddAlternativeModal } = addAlternativeModal(openAltModal$.pipe(map(() => true)));
const { component: AddCostModal } = addCostModal(openCostModal$.pipe(map(() => true)));

// just the single alternative
const altCosts$ = alt$.pipe(
    withLatestFrom(combinedCostObject$),
    map(([alt, combinedCosts]) => alt.costs.map((cost) => combinedCosts.get(cost) as Cost))
);

type Subcategories<T> = {
    [key in keyof T]: Cost[];
};

// Count all energy costs, and the count of its subcategories
const [energyCategories] = bind(
    altCosts$.pipe(
        map((costs) => costs.filter(isEnergyCost)),
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ fuelType }) => fuelType) as Subcategories<FuelType>)
    ),
    undefined
);

// Count all water costs
const [waterCosts] = bind(altCosts$.pipe(map((costs) => costs.filter(isWaterCost))), []);

// Count all capital costs and its subcategories
const [capitalCategories] = bind(
    altCosts$.pipe(
        map((costs) => costs.filter(isCapitalCost)),
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>)
    ),
    undefined
);

// Count all contract costs and its subcategories
const [contractCategories] = bind(
    altCosts$.pipe(
        map((costs) => costs.filter(isContractCost)),
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>)
    ),
    undefined
);

// Count all other costs and its subcategories
const [otherCategories] = bind(
    altCosts$.pipe(
        map((costs) => costs.filter(isOtherCost)),
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>)
    ),
    undefined
);

export default function Alternatives() {
    const navigate = useNavigate();

    // Navigate to general information page if there are no alternatives
    const alternatives = Model.useAlternatives();
    if (alternatives.length <= 0) navigate("/editor");

    const categories = [
        {
            label: "Energy Costs",
            children: energyCategories()
        },
        {
            label: "Water Costs",
            children: waterCosts()
        },
        {
            label: "Capital Costs",
            children: capitalCategories()
        },
        {
            label: "Contract Costs",
            children: contractCategories()
        },
        {
            label: "Other Costs",
            children: otherCategories()
        }
    ];

    return (
        <div className="w-full h-full bg-white p-3">
            <AddAlternativeModal />
            <AddCostModal />

            <div className={"float-right"}>
                <AddAlternativeButton type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Alternative
                </AddAlternativeButton>
                <CloneButton type={ButtonType.LINK}>
                    <Icon path={mdiContentCopy} size={1} /> Clone
                </CloneButton>
                <RemoveButton type={ButtonType.LINKERROR}>
                    <Icon path={mdiMinus} size={1} /> Remove
                </RemoveButton>
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
                    <BaselineSwitch />
                    <p>Only one alternative can be the baseline.</p>
                </span>
            </div>
            <br />
            <div className="flex justify-between">
                <Title level={4}>Alternative Costs</Title>
                <AddCostButton type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Cost
                </AddCostButton>
            </div>
            <Divider className="m-0 mb-4" />
            <div className="flex justify-between" style={{ alignContent: "space-between" }}>
                {categories.map((category) => (
                    <div className="water-costs w-40" key={category.label}>
                        <div className=" flex justify-between">
                            <Title level={5}>{category.label}</Title>
                        </div>
                        <Divider className="m-0" />
                        {Object.entries(category.children ?? {}).map(([name, costs]) => {
                            return (
                                <div className="flex flex-col justify-between m-2 border">
                                    <div className="border bg-primary text-center text-white">{name || ""}</div>
                                    <ul className="hover:cursor-pointer">
                                        {(costs as unknown as Cost[]).map((item: Cost) => (
                                            <li
                                                key={item.id}
                                                className="overflow-hidden whitespace-nowrap text-ellipsis"
                                                onClick={() => navigate(`/editor/cost/${item.id}`)}
                                            >
                                                {item?.name || "Unknown"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div />
            </div>
        </div>
    );
}
