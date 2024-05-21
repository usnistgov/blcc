import { mdiArrowLeft, mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Checkbox, Typography } from "antd";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Subject, combineLatest, map, sample, switchMap } from "rxjs";
import { match } from "ts-pattern";
import { CostTypes, type Cost as FormatCost, type ID } from "../../blcc-format/Format";
import addCostModal from "../../components/AddCostModal";
import { Button, ButtonType } from "../../components/Button";
import SubHeader from "../../components/SubHeader";
import { TextArea } from "../../components/TextArea";
import { TextInput, TextInputType } from "../../components/TextInput";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { alternative$, useAlternativeID } from "../../model/AlternativeModel";
import { CostModel } from "../../model/CostModel";
import { alternatives$, currentProject$, useAlternatives } from "../../model/Model";
import { db } from "../../model/db";
import ImplementationContractCostFields from "./cost/ImplementationContractCostFields";
import InvestmentCapitalCostFields from "./cost/InvestmentCapitalCostFields";
import OMRCostFields from "./cost/OMRCostFields";
import OtherCostFields from "./cost/OtherCostFields";
import OtherNonMonetaryCostFields from "./cost/OtherNonMonetaryCostFields";
import RecurringContractCostFields from "./cost/RecurringContractCostFields";
import ReplacementCapitalCostFields from "./cost/ReplacementCapitalCostFields";
import WaterCostFields from "./cost/WaterCostFields";
import EnergyCostFields from "./cost/energycostfields/EnergyCostFields";

const { Title } = Typography;
const [toggleAlt$, toggleAlt] = createSignal<[ID, boolean]>();

const openCostModal$ = new Subject<void>();
const cloneClick$ = new Subject<void>();
const removeClick$ = new Subject<void>();

//const { component: DescriptionInput, onChange$: description$ } = textArea(
//    CostModel.cost$.pipe(map((cost) => cost.description)),
//);
/*const { component: CostSavingSwitch, onChange$: costSavingsChange$ } = switchComp(
    cost$.pipe(map((cost) => cost.costSavings ?? false))
);*/

const { component: AddCostModal } = addCostModal(openCostModal$.pipe(map(() => true)));

const remove$ = combineLatest([CostModel.id$, currentProject$]).pipe(sample(removeClick$), switchMap(removeCost));
const clone$ = combineLatest([CostModel.cost$, currentProject$]).pipe(sample(cloneClick$), switchMap(cloneCost));

// True if only one alternative contains this cost.
// In which case we disable the user from removing the cost from all alternatives, so it does not become orphaned.
const [onlyOneAlternativeIncludes] = bind(
    combineLatest([alternatives$, CostModel.id$]).pipe(
        map(([alternatives, id]) => alternatives.filter((alt) => alt.costs.includes(id)).length <= 1),
    ),
    true,
);

function removeCost([costID, projectID]: [number, number]) {
    return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
        // Delete cost
        db.costs.where("id").equals(costID).delete();

        // Remove cost from all associated alternatives
        db.alternatives
            .filter((alternative) => alternative.costs.includes(costID))
            .modify((alternative) => {
                const index = alternative.costs.indexOf(costID);
                if (index > -1) {
                    alternative.costs.splice(index, 1);
                }
            });

        // Remove cost from project
        db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                const index = project.costs.indexOf(costID);
                if (index > -1) {
                    project.costs.splice(index, 1);
                }
            });
    });
}

async function cloneCost([cost, projectID]: [FormatCost, ID]): Promise<ID> {
    return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
        const newCost = { ...cost, id: undefined, name: `${cost.name} Copy` } as FormatCost;

        // Create new clone cost
        const newID = await db.costs.add(newCost);

        // Add to current project
        db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                project.costs.push(newID);
            });

        // Add to necessary alternatives
        db.alternatives
            .filter((alternative) => alternative.costs.includes(cost.id ?? 0))
            .modify((alternative) => {
                alternative.costs.push(newID);
            });

        return newID;
    });
}

function toggleAlternativeCost([id, [alternativeID, applied]]: [ID, [ID, boolean]]) {
    db.alternatives
        .where("id")
        .equals(alternativeID)
        .modify((alternative) => {
            if (applied) alternative.costs.push(id);
            else {
                const index = alternative.costs.indexOf(id);
                if (index > -1) {
                    alternative.costs.splice(index, 1);
                }
            }
        });
}

export default function Cost() {
    const id = CostModel.useID();
    const navigate = useNavigate();
    const alternatives = useAlternatives();
    const onlyOne = onlyOneAlternativeIncludes();
    const costType = CostModel.useType();
    const alternativeID = useAlternativeID();

    const { useAltName } = useMemo(() => {
        const [useAltName] = bind(alternative$.pipe(map((alt) => alt.name)));

        return { useAltName };
    }, []);

    const alternativeName = useAltName();

    /*useDbUpdate(costSavingsChange$, costCollection$, "costSavings");*/
    //useDbUpdate(description$.pipe(defaultValue(undefined)), costCollection$, "description");
    useSubscribe(remove$, () => navigate(`/editor/alternative/${alternativeID}`, { replace: true }), [alternativeID]);
    useSubscribe(clone$, (id) => navigate(`/editor/alternative/${alternativeID}/cost/${id}`), [alternativeID]);
    //useSubscribe(combineLatest([costID$, toggleAlt$]), toggleAlternativeCost);

    return (
        <motion.div
            className={"w-full"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, speed: 0.5 }}
            transition={{ duration: 0.2 }}
        >
            <AddCostModal />

            <SubHeader>
                <div className="flex justify-between">
                    <div>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiArrowLeft}
                            onClick={() => navigate(`/editor/alternative/${alternativeID}`, { replace: true })}
                        >
                            {alternativeName}
                        </Button>
                    </div>
                    <div>
                        <Button type={ButtonType.LINK} icon={mdiPlus} onClick={() => openCostModal$.next()}>
                            Add Cost
                        </Button>
                        <Button type={ButtonType.LINK} icon={mdiContentCopy} onClick={() => cloneClick$.next()}>
                            Clone
                        </Button>
                        <Button type={ButtonType.LINKERROR} icon={mdiMinus} onClick={() => removeClick$.next()}>
                            Remove
                        </Button>
                    </div>
                </div>
            </SubHeader>

            <div className={"max-w-screen-lg p-6"}>
                <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                    <TextInput
                        type={TextInputType.PRIMARY}
                        label={"Name"}
                        value$={CostModel.name$}
                        wire={CostModel.sName$}
                    />
                    <div className={"flex flex-col"}>
                        <Title level={5}>Alternatives applied to</Title>
                        {alternatives.map((alt) => (
                            <Checkbox
                                key={alt.id}
                                disabled={onlyOne && alt.costs.includes(id)}
                                checked={alt.costs.includes(id)}
                                onChange={(e) => toggleAlt([alt.id ?? 0, e.target.checked])}
                            >
                                {alt.name}
                            </Checkbox>
                        )) || "No Alternatives"}
                    </div>
                    <span className={"col-span-2"}>
                        <TextArea
                            label={"Description"}
                            className={"w-full"}
                            value$={CostModel.description$}
                            wire={CostModel.sDescription$}
                        />
                    </span>
                    <span>
                        <Title level={5}>Cost or Savings</Title>
                        {/*<CostSavingSwitch checkedChildren={"Savings"} unCheckedChildren={"Cost"} />*/}
                    </span>
                </div>
            </div>
            <div className={"border-t border-base-lighter"}>
                {match(costType)
                    .with(CostTypes.ENERGY, () => <EnergyCostFields />)
                    .with(CostTypes.WATER, () => <WaterCostFields />)
                    .with(CostTypes.CAPITAL, () => <InvestmentCapitalCostFields />)
                    .with(CostTypes.REPLACEMENT_CAPITAL, () => <ReplacementCapitalCostFields />)
                    .with(CostTypes.OMR, () => <OMRCostFields />)
                    .with(CostTypes.IMPLEMENTATION_CONTRACT, () => <ImplementationContractCostFields />)
                    .with(CostTypes.RECURRING_CONTRACT, () => <RecurringContractCostFields />)
                    .with(CostTypes.OTHER, () => <OtherCostFields />)
                    .with(CostTypes.OTHER_NON_MONETARY, () => <OtherNonMonetaryCostFields />)
                    .exhaustive()}
            </div>
        </motion.div>
    );
}
