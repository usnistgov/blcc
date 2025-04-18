import { mdiClose, mdiPlus } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Select, Typography } from "antd";
import {
    AnalysisType,
    type BaseCost,
    type CapitalCost,
    type Cost,
    CostTypes,
    type EnergyCost,
    EnergyUnit,
    FuelType,
    type ID,
    type ImplementationContractCost,
    LiquidUnit,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type Project,
    type RecurringContractCost,
    type ReplacementCapitalCost,
    Season,
    type WaterCost,
} from "blcc-format/Format";
import AppliedCheckboxes from "components/AppliedCheckboxes";
import { Button, ButtonType } from "components/input/Button";
import TextInput, { TextInputType } from "components/input/TextInput";
import { Match } from "effect";
import { useSubscribe } from "hooks/UseSubscribe";
import { AlternativeModel } from "model/AlternativeModel";
import { hashProject$ } from "model/Model";
import { db } from "model/db";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BehaviorSubject, type Observable, Subject, fromEvent, merge, switchMap } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { guard, sampleMany } from "util/Operators";

type AddCostModalProps = {
    open$: Observable<CostTypes | FuelType>;
};

function toOption(value: string) {
    return {
        label: <span>{value}</span>,
        value,
    };
}

enum OptionHeader {
    ENERGY = 0,
    WATER = 1,
    CAPITAL = 2,
    CONTRACT = 3,
    OTHER = 4,
}

const Options = [
    {
        label: <span>Energy</span>,
        value: OptionHeader.ENERGY,
        options: Object.values(FuelType).map((value) => toOption(value)),
    },
    {
        label: <span>Water</span>,
        value: OptionHeader.WATER,
        options: [
            {
                label: <span key={"water-option"}>Water</span>,
                value: CostTypes.WATER,
            },
        ],
    },
    {
        label: <span>Capital</span>,
        value: OptionHeader.CAPITAL,
        options: [CostTypes.CAPITAL, CostTypes.REPLACEMENT_CAPITAL, CostTypes.OMR].map((value) => toOption(value)),
    },
    {
        label: <span>Contract</span>,
        value: OptionHeader.CONTRACT,
        options: [CostTypes.IMPLEMENTATION_CONTRACT, CostTypes.RECURRING_CONTRACT].map(toOption),
    },
    {
        label: <span>Other</span>,
        value: OptionHeader.OTHER,
        options: [CostTypes.OTHER, CostTypes.OTHER_NON_MONETARY].map(toOption),
    },
];

namespace DefaultCosts {
    type Props<T> = Omit<T, keyof BaseCost>;

    export const CAPITAL: (project: Project | undefined) => Props<CapitalCost> = (project: Project | undefined) => ({
        type: CostTypes.CAPITAL,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
    });

    export const ENERGY: (fuelType: FuelType, project: Project | undefined) => Props<EnergyCost> = (
        fuelType: FuelType,
        project: Project | undefined,
    ) => ({
        type: CostTypes.ENERGY,
        fuelType,
        costPerUnit: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        annualConsumption: 0,
        unit: EnergyUnit.KWH,
        useIndex: 1,
    });

    export const WATER: (project: Project | undefined) => Props<WaterCost> = (project: Project | undefined) => ({
        type: CostTypes.WATER,
        unit: LiquidUnit.GALLON,
        escalation: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        usage: [
            {
                season: Season.SUMMER,
                amount: 0,
                costPerUnit: 0,
            },
            {
                season: Season.WINTER,
                amount: 0,
                costPerUnit: 0,
            },
        ],
        disposal: [
            {
                season: Season.SUMMER,
                amount: 0,
                costPerUnit: 0,
            },
            {
                season: Season.WINTER,
                amount: 0,
                costPerUnit: 0,
            },
        ],
        useIndex: 1,
    });

    export const REPLACEMENT_CAPITAL: (project: Project | undefined) => Props<ReplacementCapitalCost> = (
        project: Project | undefined,
    ) => ({
        type: CostTypes.REPLACEMENT_CAPITAL,
        initialOccurrence: 1,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
    });

    export const OMR: (project: Project | undefined) => Props<OMRCost> = (project: Project | undefined) => ({
        type: CostTypes.OMR,
        initialOccurrence: 1,
        rateOfChangeValue: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        recurring: {
            rateOfRecurrence: 1,
            duration:
                project !== undefined && project.studyPeriod !== undefined
                    ? project.studyPeriod - project.constructionPeriod
                    : undefined,
        },
    });

    export const IMPLEMENTATION_CONTRACT: (project: Project | undefined) => Props<ImplementationContractCost> = (
        project: Project | undefined,
    ) => ({
        type: CostTypes.IMPLEMENTATION_CONTRACT,
        rateOfChangeValue: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        initialOccurrence: 1,
    });

    export const RECURRING_CONTRACT: (project: Project | undefined) => Props<RecurringContractCost> = (
        project: Project | undefined,
    ) => ({
        type: CostTypes.RECURRING_CONTRACT,
        initialOccurrence: 1,
        rateOfChangeValue: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        recurring: {
            rateOfRecurrence: 1,
            duration:
                project !== undefined && project.studyPeriod !== undefined
                    ? project.studyPeriod - project.constructionPeriod
                    : undefined,
        },
    });

    export const OTHER: (project: Project | undefined) => Props<OtherCost> = (project: Project | undefined) => ({
        type: CostTypes.OTHER,
        tags: ["Other"], // This cost is hidden from the user and can't be removed
        initialOccurrence: 1,
        valuePerUnit: 0,
        rateOfChangeValue: 0,
        rateOfChangeUnits: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        numberOfUnits: 0,
        recurring: {
            rateOfRecurrence: 1,
        },
    });

    export const OTHER_NON_MONETARY: (project: Project | undefined) => Props<OtherNonMonetary> = (
        project: Project | undefined,
    ) => ({
        type: CostTypes.OTHER_NON_MONETARY,
        initialOccurrence: 1,
        numberOfUnits: 0,
        costSavings: project !== undefined && project.analysisType === AnalysisType.MILCON_ECIP,
        rateOfChangeUnits: 0,
    });
}

/**
 * Creates the new cost and adds it to the database. Returns the ID of the newly created cost.
 *
 * @param projectID The project ID to add the cost to.
 * @param name The name of the new cost.
 * @param type The type of the new cost, either a CostType or a FuelType for energy costs.
 * @param alts A list of alternatives to add the cost to.
 */
function createCostInDB([project, name, type, alts]: [
    Project | undefined,
    string,
    CostTypes | FuelType,
    Set<number>,
]): Promise<ID> {
    return db.transaction("rw", db.costs, db.projects, db.alternatives, async () => {
        const newCost = {
            name,
            ...Match.value(type).pipe(
                Match.when(CostTypes.CAPITAL, () => DefaultCosts.CAPITAL(project)),
                Match.when(CostTypes.WATER, () => DefaultCosts.WATER(project)),
                Match.when(CostTypes.REPLACEMENT_CAPITAL, () => DefaultCosts.REPLACEMENT_CAPITAL(project)),
                Match.when(CostTypes.OMR, () => DefaultCosts.OMR(project)),
                Match.when(CostTypes.IMPLEMENTATION_CONTRACT, () => DefaultCosts.IMPLEMENTATION_CONTRACT(project)),
                Match.when(CostTypes.RECURRING_CONTRACT, () => DefaultCosts.RECURRING_CONTRACT(project)),
                Match.when(CostTypes.OTHER, () => DefaultCosts.OTHER(project)),
                Match.when(CostTypes.OTHER_NON_MONETARY, () => DefaultCosts.OTHER_NON_MONETARY(project)),
                Match.when(CostTypes.ENERGY, () => DefaultCosts.ENERGY(FuelType.ELECTRICITY, project)),
                Match.orElse((fuelType) => DefaultCosts.ENERGY(fuelType, project)),
            ),
        } as Cost;

        // Add new cost to DB and get new ID
        const newID = await db.costs.add(newCost);

        // Add new cost ID to project
        await db.projects
            .where("id")
            .equals(project?.id ?? 1)
            .modify((project) => {
                project.costs.push(newID);
            });

        // Add new cost ID to alternatives
        await db.alternatives
            .where("id")
            .anyOf([...alts.values()])
            .modify((alt) => {
                alt.costs.push(newID);
            });

        return newID;
    });
}

export default function AddCostModal({ open$ }: AddCostModalProps) {
    const navigate = useNavigate();

    const [
        useOpen,
        cancel,
        disableAdd,
        sCheckAlt$,
        sName$,
        sType$,
        sAddClick$,
        sCancelClick$,
        isOpen$,
        defaultChecked,
        useType,
    ] = useMemo(() => {
        const sName$ = new BehaviorSubject<string | undefined>(undefined);
        const sAddClick$ = new Subject<void>();
        const sCancelClick$ = new Subject<void>();
        const sType$ = new BehaviorSubject<CostTypes | FuelType>(CostTypes.CAPITAL);
        const sCheckAlt$ = new Subject<Set<ID>>();

        // Create the new cost in the DB
        const newCostID$ = sampleMany(sAddClick$, [hashProject$, sName$.pipe(guard()), sType$, sCheckAlt$]).pipe(
            switchMap(createCostInDB),
            withLatestFrom(AlternativeModel.ID$),
        );

        newCostID$.subscribe(([newID, altID]) => navigate(`/editor/alternative/${altID}/cost/${newID}`));

        const [modalCancel$, cancel] = createSignal();
        const [useOpen, isOpen$] = bind(
            merge(open$.pipe(map(() => true)), merge(sCancelClick$, modalCancel$).pipe(map(() => false))),
            false,
        );

        const [disableAdd] = bind(sName$.pipe(map((name) => name === "" || name === undefined)), true);
        const [defaultChecked] = bind(AlternativeModel.sID$.pipe(map((id) => [id])), []);
        const [useType] = bind(sType$, CostTypes.CAPITAL);

        return [
            useOpen,
            cancel,
            disableAdd,
            sCheckAlt$,
            sName$,
            sType$,
            sAddClick$,
            sCancelClick$,
            isOpen$,
            defaultChecked,
            useType,
        ];
    }, [open$, navigate]);

    useSubscribe(open$, sType$);

    //Clear fields when modal closes
    useSubscribe(isOpen$, (open) => {
        if (open) return;

        sName$.next(undefined);
        sType$.next(FuelType.ELECTRICITY);
    });

    useSubscribe(fromEvent(window, "keydown"), (event) => {
        if ((event as KeyboardEvent).code === "Enter") {
            sAddClick$.next();
        }
    });

    const costOrFuel = useType();

    return (
        <Modal
            title="Add New Cost"
            open={useOpen()}
            onCancel={cancel}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.ERROR} icon={mdiClose} wire={sCancelClick$}>
                        Cancel
                    </Button>
                    <Button type={ButtonType.PRIMARY} icon={mdiPlus} disabled={disableAdd()} wire={sAddClick$}>
                        Add
                    </Button>
                </div>
            }
        >
            <div>
                <Typography.Title level={5}>Name</Typography.Title>
                <TextInput type={TextInputType.PRIMARY} wire={sName$} showCount maxLength={45} />
            </div>
            <br />
            <div className="w-full">
                <Typography.Title level={5}>Add to Alternatives</Typography.Title>
                <AppliedCheckboxes defaults={defaultChecked()} wire={sCheckAlt$} />
            </div>
            <br />
            <div>
                <Typography.Title level={5}>Cost Category</Typography.Title>
                <Select
                    className={"w-full"}
                    options={Options}
                    onSelect={(costOrFuel: CostTypes | FuelType) => sType$.next(costOrFuel)}
                    value={costOrFuel}
                />
            </div>
        </Modal>
    );
}
