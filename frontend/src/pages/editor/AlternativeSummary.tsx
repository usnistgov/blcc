import { mdiAlphaBBox, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { map, withLatestFrom } from "rxjs/operators";
import { Cost, EnergyCost } from "../../blcc-format/Format";
import button, { ButtonType } from "../../components/Button";
import { Model } from "../../model/Model";
import { countProperty } from "../../util/Operators";
import { getNewID, isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";
import { createSignal } from "@react-rxjs/utils";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { sample } from "rxjs";

const { Title } = Typography;
const { click$: addAlternativeClick$, component: AddAlternativeButton } = button();

export const addAlternative$ = Model.alternatives$.pipe(
    sample(addAlternativeClick$),
    //TODO open modal instead
    map((alternatives) => {
        const nextID = getNewID(alternatives);

        return {
            id: nextID,
            name: `New Alternative ${nextID}`,
            costs: []
        };
    })
);

const combinedCostObject$ = Model.costs$.pipe(map((costs) => new Map(costs.map((cost) => [cost.id, cost]))));

export { combinedCostObject$ };

const [useCards] = bind(Model.alternatives$.pipe(map((alts) => alts.map((_a, i) => createAlternativeCard(i)))), []);

export default function AlternativeSummary() {
    const cards = useCards();

    return (
        <div className={"flex h-full w-full flex-col items-center"}>
            <div className={"flex w-3/4 max-w-6xl flex-col"}>
                <div className={"flex flex-row-reverse border-b border-base-lighter"}>
                    <AddAlternativeButton className={"my-2"} type={ButtonType.LINK}>
                        <Icon path={mdiPlus} size={1} />
                        Add Alternative
                    </AddAlternativeButton>
                </div>
            </div>
            <br />
            {(cards.length !== 0 && cards.map((card, i) => <card.component key={i} />)) || (
                <div className={"w-full p-8 text-center text-base-dark"}>
                    <p className={"text-2xl"}>No Alternatives</p>
                    <p className={"text-lg"}>Create an alternative or load a saved file</p>
                </div>
            )}
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

    const [cardClick$, click] = createSignal();

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
            const navigate = useNavigate();
            useSubscribe(alt$.pipe(sample(cardClick$)), (alt) => navigate(`/editor/alternative/${alt.id}`));

            return (
                <div
                    className={
                        "max-2-6xl mb-5 flex w-3/4 cursor-pointer flex-col rounded border border-base-lighter p-5 shadow-lg"
                    }
                    onClick={click}
                >
                    <div className={"flex flex-row gap-1"}>
                        {alt()?.baseline && <Icon path={mdiAlphaBBox} size={1.2} />}
                        <Title level={4}>{alt()?.name}</Title>
                    </div>
                    <p>{alt()?.description}</p>
                    <br />
                    <div className={"flex flex-row justify-between gap-6"}>
                        {/* Render each category */}
                        {categories.map((category) => (
                            <div className={"flex flex-col"}>
                                <div className={"flex gap-6"}>
                                    <Title level={5}>{category.label}</Title>
                                    <p>{category.hook().length}</p>
                                </div>
                                <Divider className={"m-0"} />

                                {/* Render each subcategory */}
                                {category.children?.().map(([type, count]) => (
                                    <div className={"flex gap-6"}>
                                        <p className={"grow"}>{type}</p>
                                        <div className={"w-fit"}>
                                            <p>{count}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };
}
