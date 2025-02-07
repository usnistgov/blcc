import { mdiAlphaBBox, mdiContentCopy, mdiDelete, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Typography } from "antd";
import type { Alternative, Cost, EnergyCost, ID } from "blcc-format/Format";
import SubHeader from "components/SubHeader";
import { Button, ButtonType } from "components/input/Button";
import AddAlternativeModal from "components/modal/AddAlternativeModal";
import { Strings } from "constants/Strings";
import { liveQuery } from "dexie";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import { AlternativeModel } from "model/AlternativeModel";
import { alternatives$ } from "model/Model";
import { db } from "model/db";
import { Fragment, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Subject, of, switchMap } from "rxjs";
import { map } from "rxjs/operators";
import { confirm, countProperty } from "util/Operators";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "util/Util";

const { Title } = Typography;

const addAlternativeClick$ = new Subject<void>();

const confirmBaselineChange$ = new Subject<ID>();
const [useCards] = bind(alternatives$.pipe(map((alts) => alts.map(createAlternativeCard))));

export default function AlternativeSummary() {
    const navigate = useNavigate();

    const cards = useCards();

    const [changeBaseline$] = useMemo(() => {
        const changeBaseline$ = confirmBaselineChange$.pipe(
            confirm(
                "Change Baseline?",
                "Only one alternative can be the baseline. Changing this will disable the current baseline.",
            ),
        );

        return [changeBaseline$];
    }, []);

    useSubscribe(changeBaseline$, AlternativeModel.sMakeBaseline$);
    useSubscribe(AlternativeModel.Actions.clonedAlternative$, (id) => navigate(`/editor/alternative/${id}`));
    useSubscribe(AlternativeModel.Actions.removeAlternative$);

    return (
        <motion.div
            className={"flex h-full w-full flex-col"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.08 }}
        >
            <SubHeader>
                <div className={"flex w-3/4 max-w-6xl flex-col self-center"}>
                    <AddAlternativeModal open$={addAlternativeClick$.pipe(map(() => true))} />
                    <Button className={"self-end"} type={ButtonType.LINK} onClick={() => addAlternativeClick$.next()}>
                        <Icon path={mdiPlus} size={1} />
                        Add Alternative
                    </Button>
                </div>
            </SubHeader>

            <div className={"flex h-full w-full flex-col items-center overflow-y-auto"}>
                <br />
                {(cards.length !== 0 && cards.map((card) => <card.component key={card.id} />)) || (
                    <div className={"w-full p-8 text-center text-base-dark"}>
                        <p className={"text-2xl"}>No Alternatives</p>
                        <p className={"text-lg"}>Create an alternative or load a saved file</p>
                    </div>
                )}
                {/* scroll off spacer */}
                <div id={"spacer"} className={"mb-32"} />
            </div>
        </motion.div>
    );
}

export function createAlternativeCard(alternative: Alternative) {
    const altCosts$ = of(alternative).pipe(
        switchMap((alt) => liveQuery(() => db.costs.where("id").anyOf(alt.costs).toArray())),
    );

    // Count all energy costs, and the count of its subcategories
    const [energyCosts, energyCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isEnergyCost))));
    const [fuelSubcategories] = bind(energyCosts$.pipe(countProperty((cost) => (cost as EnergyCost).fuelType)));

    // Count all water costs
    const [waterCosts] = bind(altCosts$.pipe(map((costs) => costs.filter(isWaterCost))));

    // Count all capital costs and its subcategories
    const [capitalCosts, capitalCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isCapitalCost))));
    const [capitalSubcategories] = bind(capitalCosts$.pipe(countProperty((cost) => (cost as Cost).type)));

    // Count all contract costs and its subcategories
    const [contractCosts, contractCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isContractCost))));
    const [contractSubcategories] = bind(contractCosts$.pipe(countProperty((cost) => (cost as Cost).type)));

    // Count all other costs and its subcategories
    const [otherCosts, otherCosts$] = bind(altCosts$.pipe(map((costs) => costs.filter(isOtherCost))));
    const [otherSubcategories] = bind(otherCosts$.pipe(countProperty((cost) => (cost as Cost).type)));

    const [cardClick$, click] = createSignal();

    // The categories with their associated hooks and subcategory hooks
    const categories = [
        {
            label: "Energy Costs",
            hook: energyCosts,
            children: fuelSubcategories,
        },
        {
            label: "Water Costs",
            hook: waterCosts,
        },
        {
            label: "Capital Component Costs",
            hook: capitalCosts,
            children: capitalSubcategories,
        },
        {
            label: "Contract Costs",
            hook: contractCosts,
            children: contractSubcategories,
        },
        {
            label: "Other Costs",
            hook: otherCosts,
            children: otherSubcategories,
        },
    ];
    return {
        id: alternative.id,
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
                    <div className={"flex flex-row flex-nowrap justify-between gap-1"}>
                        <div className={"flex flex-row gap-2"}>
                            {alternative.baseline && <Icon path={mdiAlphaBBox} size={1.2} />}
                            <Title level={4}>{alternative.name}</Title>
                        </div>
                        <div className={"flex flex-row gap-2"}>
                            {!alternative.baseline && (
                                <Button
                                    type={ButtonType.LINK}
                                    icon={mdiAlphaBBox}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (alternative.id !== undefined) confirmBaselineChange$.next(alternative.id);
                                    }}
                                >
                                    Set as Baseline
                                </Button>
                            )}
                            <Button
                                type={ButtonType.LINK}
                                icon={mdiContentCopy}
                                tooltip={Strings.CLONE}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (alternative.id !== undefined) AlternativeModel.Actions.clone(alternative.id);
                                }}
                            >
                                Clone
                            </Button>
                            <Button
                                type={ButtonType.LINKERROR}
                                icon={mdiDelete}
                                tooltip={Strings.DELETE}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (alternative.id !== undefined)
                                        AlternativeModel.Actions.deleteByID(alternative.id);
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                    <p className={"max-w-[32rem] pb-4"}>{alternative.description}</p>
                    <br />
                    <div className={"flex min-h-16 flex-row justify-between gap-6"}>
                        {/* Render each category */}
                        {categories.map((category) => (
                            <div className={"grid h-fit grid-cols-[auto,_1fr] gap-x-4"} key={category.label}>
                                <p className={"pb-1 font-bold"}>{category.label}</p>
                                <p>{category.hook().length}</p>
                                <div className={"col-span-2 mb-2 h-0 w-full border-b-2"} />

                                {/* Render each subcategory */}
                                {category.children?.().map(([type, count]) => (
                                    <Fragment key={type}>
                                        <p className={"grow"}>{type}</p>
                                        <div className={"w-fit"}>
                                            <p>{count}</p>
                                        </div>
                                    </Fragment>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            );
        },
    };
}
