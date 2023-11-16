import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { map, withLatestFrom } from "rxjs/operators";
import { Cost, EnergyCost } from "../../blcc-format/Format";
import button, { ButtonType } from "../../components/Button";
import { Model } from "../../model/Model";
import { countProperty } from "../../util/Operators";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";

const { Title } = Typography;
const { component: Button } = button();

const combinedCostObject$ = Model.costs$.pipe(map((costs) => new Map(costs.map((cost) => [cost.id, cost]))));

const [useCards] = bind(Model.alternatives$.pipe(map((alts) => alts.map((_a, i) => createAlternativeCard(i)))), []);

export default function AlternativeSummary() {
    return (
        <div className={"w-full h-full"}>
            <div className="add-alternative flex flex-col">
                <div className="flex flex-row-reverse">
                    <Button className="" type={ButtonType.LINK}>
                        <Icon path={mdiPlus} size={1} />
                        Add Alternative
                    </Button>
                </div>
                <Divider className="p-0 m-0" />
            </div>
            <br />
            {useCards().map((card, i) => (
                <card.component key={i} />
            ))}
        </div>
    );
}

export function createAlternativeCard(index: number) {
    const alt$ = Model.alternatives$.pipe(map((alts) => alts[index]));
    const [alt] = bind(alt$, undefined);

    const altCosts$ = alt$.pipe(
        withLatestFrom(combinedCostObject$),
        map(([alt, combinedCosts]) => alt.costs.map((cost) => combinedCosts.get(cost) as Cost))
    );

    // Count all energy costs, and the count of its subcategories
    const [energyCosts, energyCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isEnergyCost))), []);
    const [fuelSubcategories] = bind(energyCosts$.pipe(countProperty((cost) => (cost as EnergyCost).fuelType)), []);

    // Count all water costs
    const [waterCosts] = bind(altCosts$.pipe(map((costs) => costs.filter(isWaterCost))), []);

    // Count all capital costs and its subcategories
    const [capitalCosts, capitalCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isCapitalCost))), []);
    const [capitalSubcategories] = bind(capitalCosts$.pipe(countProperty((cost) => (cost as Cost).type)), []);

    // Count all contract costs and its subcategories
    const [contractCosts, contractCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isContractCost))), []);
    const [contractSubcategories] = bind(contractCosts$.pipe(countProperty((cost) => (cost as Cost).type)), []);

    // Count all other costs and its subcategories
    const [otherCosts, otherCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isOtherCost))), []);
    const [otherSubcategories] = bind(otherCosts$.pipe(countProperty((cost) => (cost as Cost).type)), []);

    // The categories with their associated hooks and subcategory hooks
    const categories = [
        {
            label: "Energy Costs",
            hook: energyCosts,
            children: fuelSubcategories
        },
        {
            label: "Water Costs",
            hook: waterCosts
        },
        {
            label: "Capital Costs",
            hook: capitalCosts,
            children: capitalSubcategories
        },
        {
            label: "Contract Costs",
            hook: contractCosts,
            children: contractSubcategories
        },
        {
            label: "Other Costs",
            hook: otherCosts,
            children: otherSubcategories
        }
    ];
    return {
        component: function AltCard() {
            return (
                <div className="flex justify-center align-middle">
                    <div className="bg-primary-light p-5 w-3/4 rounded mb-5">
                        <Title level={4}>{alt()?.name}</Title>
                        <p>{alt()?.description}</p>
                        <br />
                        <div className="costs flex justify-between" key={index}>
                            {/* Render each category */}
                            {categories.map((category) => (
                                <div className="water-costs w-40" key={category.label}>
                                    <div className=" flex justify-between">
                                        <Title level={5}>{category.label}</Title>
                                        <p>{category.hook().length}</p>
                                    </div>
                                    <Divider className="m-0" />

                                    {/* Render each subcategory */}
                                    {category.children?.().map(([type, count]) => (
                                        <div className="flex justify-between" key={type}>
                                            <p>{type}</p>
                                            <p>{count}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };
}
