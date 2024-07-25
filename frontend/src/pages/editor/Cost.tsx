import { mdiArrowLeft, mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { shareLatest, state, useStateObservable } from "@react-rxjs/core";
import { Typography } from "antd";
import { CostTypes, type Cost as FormatCost, type ID } from "blcc-format/Format";
import AppliedCheckboxes from "components/AppliedCheckboxes";
import SubHeader from "components/SubHeader";
import { Button, ButtonType } from "components/input/Button";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import AddCostModal from "components/modal/AddCostModal";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import useParamSync from "hooks/useParamSync";
import { AlternativeModel } from "model/AlternativeModel";
import { CostModel } from "model/CostModel";
import { alternatives$, currentProject$ } from "model/Model";
import { db } from "model/db";
import ImplementationContractCostFields from "pages/editor/cost/ImplementationContractCostFields";
import InvestmentCapitalCostFields from "pages/editor/cost/InvestmentCapitalCostFields";
import OMRCostFields from "pages/editor/cost/OMRCostFields";
import OtherCostFields from "pages/editor/cost/OtherCostFields";
import OtherNonMonetaryCostFields from "pages/editor/cost/OtherNonMonetaryCostFields";
import RecurringContractCostFields from "pages/editor/cost/RecurringContractCostFields";
import ReplacementCapitalCostFields from "pages/editor/cost/ReplacementCapitalCostFields";
import WaterCostFields from "pages/editor/cost/WaterCostFields";
import EnergyCostFields from "pages/editor/cost/energycostfields/EnergyCostFields";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Subject, combineLatest, map, sample, switchMap } from "rxjs";
import { match } from "ts-pattern";
import Switch from "../../components/input/Switch";
import sToggleAlt$ = CostModel.sToggleAlt$;
import { tap } from "rxjs/operators";

const { Title } = Typography;

const openCostModal$ = new Subject<void>();
const cloneClick$ = new Subject<void>();
const removeClick$ = new Subject<void>();

const remove$ = combineLatest([CostModel.id$, currentProject$]).pipe(sample(removeClick$), switchMap(removeCost));
const clone$ = combineLatest([CostModel.cost$, currentProject$]).pipe(sample(cloneClick$), switchMap(cloneCost));

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

const COPY_REGEX = /^(.*)( Copy)(?:\((\d+)\))?$/;

/**
 * Returns the new name for a cloned cost. The first one has "... Copy" appended onto it, with each successive copy
 * being given a number: "... Copy(1)", "... Copy(2)", etc.
 * @param name The name to copy.
 */
function clonedCostName(name: string): string {
    if (COPY_REGEX.test(name))
        return name.replace(
            COPY_REGEX,
            (_, name, copyString, num) => `${name}${copyString}(${Number.parseInt(num ?? "0") + 1})`,
        );

    return `${name} Copy`;
}

/**
 * Clones the current cost, gives it a new name, and adds it to the database.
 * @param cost The cost to clone.
 * @param projectID The ID of the project to add the new cloned cost to.
 */
async function cloneCost([cost, projectID]: [FormatCost, ID]): Promise<ID> {
    return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
        const newCost = { ...cost, id: undefined, name: clonedCostName(cost.name) } as FormatCost;

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

export default function Cost() {
    useParamSync();

    const [altsThatInclude$] = useMemo(() => {
        const altsThatInclude$ = combineLatest([alternatives$, CostModel.id$]).pipe(
            map(
                ([alternatives, id]) =>
                    new Set(alternatives.filter((alt) => alt.costs.includes(id)).map((alt) => alt.id ?? -1)),
            ),
            shareLatest(),
        );

        return [altsThatInclude$];
    }, []);

    const navigate = useNavigate();
    const costType = CostModel.useType();
    const alternativeID = AlternativeModel.useID();
    const name = useStateObservable(AlternativeModel.name$);

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
            <AddCostModal open$={openCostModal$.pipe(map(() => true))} />

            <SubHeader>
                <div className="flex justify-between">
                    <div>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiArrowLeft}
                            onClick={() => navigate(`/editor/alternative/${alternativeID}`, { replace: true })}
                        >
                            {name}
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
                        <AppliedCheckboxes value$={altsThatInclude$} sToggle$={sToggleAlt$} />
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
                        <Switch
                            value$={CostModel.costSavings$}
                            wire={CostModel.sCostSavings$}
                            checkedChildren={"Savings"}
                            unCheckedChildren={"Cost"}
                        />
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
