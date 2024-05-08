import { combineLatest, map, sample, Subject, switchMap } from "rxjs";
import { type Cost as FormatCost, CostTypes, type ID } from "../../blcc-format/Format";
import { ButtonType, Button } from "../../components/Button";
import { mdiArrowLeft, mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { Checkbox, Typography } from "antd";
import textInput, { TextInputType } from "../../components/TextInput";
import switchComp from "../../components/Switch";
import textArea from "../../components/TextArea";
import { bind } from "@react-rxjs/core";
import EnergyCostFields from "./cost/EnergyCostFields";
import { cost$, costCollection$, costID$, useCostID, useCostType } from "../../model/CostModel";
import { createSignal } from "@react-rxjs/utils";
import WaterCostFields from "./cost/WaterCostFields";
import InvestmentCapitalCostFields from "./cost/InvestmentCapitalCostFields";
import ReplacementCapitalCostFields from "./cost/ReplacementCapitalCostFields";
import OMRCostFields from "./cost/OMRCostFields";
import ImplementationContractCostFields from "./cost/ImplementationContractCostFields";
import RecurringContractCostFields from "./cost/RecurringContractCostFields";
import OtherCostFields from "./cost/OtherCostFields";
import OtherNonMonetaryCostFields from "./cost/OtherNonMonetaryCostFields";
import { isLoaded, useAlternativeID, useAltName } from "../../model/AlternativeModel";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { alternatives$, currentProject$, useAlternatives } from "../../model/Model";
import { useDbUpdate } from "../../hooks/UseDbUpdate";
import { defaultValue } from "../../util/Operators";
import addCostModal from "../../components/AddCostModal";
import { db } from "../../model/db";
import SubHeader from "../../components/SubHeader";
import { match } from "ts-pattern";

const { Title } = Typography;
const [toggleAlt$, toggleAlt] = createSignal<[ID, boolean]>();

const openCostModal$ = new Subject<void>();
const cloneClick$ = new Subject<void>();
const removeClick$ = new Subject<void>();

const { component: NameInput, onChange$: name$ } = textInput(cost$.pipe(map((cost) => cost.name)));
const { component: DescriptionInput, onChange$: description$ } = textArea(cost$.pipe(map((cost) => cost.description)));
const { component: CostSavingSwitch, onChange$: costSavingsChange$ } = switchComp(
    cost$.pipe(map((cost) => cost.costSavings ?? false))
);

const { component: AddCostModal } = addCostModal(openCostModal$.pipe(map(() => true)));

const remove$ = combineLatest([costID$, currentProject$]).pipe(sample(removeClick$), switchMap(removeCost));
const clone$ = combineLatest([cost$, currentProject$]).pipe(sample(cloneClick$), switchMap(cloneCost));

// True if only one alternative contains this cost.
// In which case we disable the user from removing the cost from all alternatives, so it does not become orphaned.
const [onlyOneAlternativeIncludes] = bind(
    combineLatest([alternatives$, costID$]).pipe(
        map(([alternatives, id]) => alternatives.filter((alt) => alt.costs.includes(id)).length <= 1)
    ),
    true
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
    const loaded = isLoaded();
    const id = useCostID();
    const alternativeName = useAltName();
    const navigate = useNavigate();
    const alternatives = useAlternatives();
    const onlyOne = onlyOneAlternativeIncludes();
    const costType = useCostType();
    const alternativeID = useAlternativeID();

    useDbUpdate(costSavingsChange$, costCollection$, "costSavings");
    useDbUpdate(name$.pipe(defaultValue("Unnamed Cost")), costCollection$, "name");
    useDbUpdate(description$.pipe(defaultValue(undefined)), costCollection$, "description");
    useSubscribe(remove$, () => navigate(`/editor/alternative/${alternativeID}`, { replace: true }), [alternativeID]);
    useSubscribe(clone$, (id) => navigate(`/editor/alternative/${alternativeID}/cost/${id}`), [alternativeID]);
    useSubscribe(combineLatest([costID$, toggleAlt$]), toggleAlternativeCost);

    if (!loaded)
        return <></>

    return (
        <div className={"w-full"}>
            <AddCostModal />

            <SubHeader>
                <div className="flex justify-between">
                    <div>
                        <Button type={ButtonType.LINK} icon={mdiArrowLeft} onClick={() => navigate(`/editor/alternative/${alternativeID}`, { replace: true })}>
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
                    <NameInput type={TextInputType.PRIMARY} label={"Name"} />
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
                        <DescriptionInput label={"Description"} className={"w-full"} />
                    </span>
                    <span>
                        <Title level={5}>Cost or Savings</Title>
                        <CostSavingSwitch checkedChildren={"Savings"} unCheckedChildren={"Cost"} />
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
        </div>
    );
}
