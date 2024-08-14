import { mdiArrowLeft, mdiChevronRight, mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { shareLatest, useStateObservable } from "@react-rxjs/core";
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
import { Subject, combineLatest, map, of, sample, switchMap } from "rxjs";
import { match } from "ts-pattern";
import { cloneName } from "util/Util";
import Switch from "../../components/input/Switch";
import sToggleAlt$ = CostModel.sToggleAlt$;
import Icon from "@mdi/react";
import ConfirmationModal from "components/modal/ConfirmationModal";

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

/**
 * Clones the current cost, gives it a new name, and adds it to the database.
 * @param cost The cost to clone.
 * @param projectID The ID of the project to add the new cloned cost to.
 */
async function cloneCost([cost, projectID]: [FormatCost, ID]): Promise<ID> {
    return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
        const newCost = { ...cost, id: undefined, name: cloneName(cost.name) } as FormatCost;

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

    const [altsThatInclude$, sConfirmBaselineChange$] = useMemo(() => {
        const altsThatInclude$ = combineLatest([alternatives$, CostModel.id$]).pipe(
            map(
                ([alternatives, id]) =>
                    new Set(alternatives.filter((alt) => alt.costs.includes(id)).map((alt) => alt.id ?? -1)),
            ),
            shareLatest(),
        );

        const sConfirmBaselineChange$ = new Subject<boolean>();

        return [altsThatInclude$, sConfirmBaselineChange$];
    }, []);

    useSubscribe(sConfirmBaselineChange$);

    const navigate = useNavigate();
    const costType = CostModel.useType();
    const alternativeID = AlternativeModel.useID();
    const alternativeName = useStateObservable(AlternativeModel.name$);
    const costName = useStateObservable(CostModel.name$);

    /*useDbUpdate(costSavingsChange$, costCollection$, "costSavings");*/
    //useDbUpdate(description$.pipe(defaultValue(undefined)), costCollection$, "description");
    useSubscribe(remove$, () => navigate(`/editor/alternative/${alternativeID}`, { replace: true }), [alternativeID]);
    useSubscribe(clone$, (id) => navigate(`/editor/alternative/${alternativeID}/cost/${id}`), [alternativeID]);
    //useSubscribe(combineLatest([costID$, toggleAlt$]), toggleAlternativeCost);

    return (
        <motion.div
            className={"w-full h-full flex flex-col"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, speed: 0.5 }}
            transition={{ duration: 0.2 }}
        >
            <AddCostModal open$={openCostModal$.pipe(map(() => costType))} />

            <SubHeader>
                <div className="flex justify-between">
                    <div className={"flex flex-row items-center"}>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiArrowLeft}
                            onClick={() => navigate(`/editor/alternative/${alternativeID}`, { replace: true })}
                        >
                            {alternativeName}
                        </Button>
                        <Icon path={mdiChevronRight} size={0.8} className={"text-ink"} />
                        <p className={"px-2 text-ink"}>{costName}</p>
                    </div>
                    <div className={"px-6"}>
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

            <div className={"w-full h-full overflow-y-auto"}>
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
                                className={"w-full max-h-36"}
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
                <div className={"border-t border-base-lighter mb-32"}>
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
            </div>
        </motion.div>
    );
}
