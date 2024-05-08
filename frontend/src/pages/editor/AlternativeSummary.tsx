import { mdiAlphaBBox, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { map } from "rxjs/operators";
import type { Alternative, Cost, EnergyCost } from "../../blcc-format/Format";
import button, { ButtonType } from "../../components/Button";
import { alternatives$ } from "../../model/Model";
import { countProperty } from "../../util/Operators";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../../util/Util";
import { createSignal } from "@react-rxjs/utils";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { of, switchMap } from "rxjs";
import addAlternativeModal from "../../components/AddAlternativeModal";
import { db } from "../../model/db";
import { liveQuery } from "dexie";
import SubHeader from "../../components/SubHeader";
import { AnimatePresence, motion } from "framer-motion";

const { Title } = Typography;
const { click$: addAlternativeClick$, component: AddAlternativeButton } = button();
const { component: AddAlternativeModal } = addAlternativeModal(addAlternativeClick$.pipe(map(() => true)));

const [useCards] = bind(alternatives$.pipe(map((alts) => alts.map(createAlternativeCard))), []);

export default function AlternativeSummary() {
    const cards = useCards();

    return (
        <motion.div exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
            <SubHeader>
                <div className={"flex w-3/4 max-w-6xl flex-col self-center"}>
                    <AddAlternativeModal />
                    <AddAlternativeButton className={"self-end"} type={ButtonType.LINK}>
                        <Icon path={mdiPlus} size={1} />
                        Add Alternative
                    </AddAlternativeButton>
                </div>
            </SubHeader>
            <div className={"flex h-full w-full flex-col items-center"}>
                <br />
                {(cards.length !== 0 && cards.map((card) => <card.component key={card.component.name} />)) || (
                    <div className={"w-full p-8 text-center text-base-dark"}>
                        <p className={"text-2xl"}>No Alternatives</p>
                        <p className={"text-lg"}>Create an alternative or load a saved file</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function createAlternativeCard(alternative: Alternative) {
    const altCosts$ = of(alternative).pipe(
        switchMap((alt) => liveQuery(() => db.costs.where("id").anyOf(alt.costs).toArray()))
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
            useSubscribe(cardClick$, () => navigate(`/editor/alternative/${alternative.id}`));

            return (
                <div
                    className={
                        "mb-5 flex w-3/4 max-w-6xl cursor-pointer flex-col rounded border border-base-lighter p-5 shadow-lg"
                    }
                    onClick={click}
                    onKeyDown={click}
                >
                    <div className={"flex flex-row gap-1"}>
                        {alternative.baseline && <Icon path={mdiAlphaBBox} size={1.2} />}
                        <Title level={4}>{alternative.name}</Title>
                    </div>
                    <p>{alternative.description}</p>
                    <br />
                    <div className={"flex flex-row justify-between gap-6"}>
                        {/* Render each category */}
                        {categories.map((category) => (
                            <div className={"flex flex-col"} key={category.label}>
                                <div className={"flex gap-6"}>
                                    <Title level={5}>{category.label}</Title>
                                    <p>{category.hook().length}</p>
                                </div>
                                <Divider className={"m-0"} />

                                {/* Render each subcategory */}
                                {category.children?.().map(([type, count]) => (
                                    <div className={"flex gap-6"} key={type}>
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
