import { mdiClose, mdiPlus } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Typography } from "antd";
import {
    type BaseCost,
    type CapitalCost,
    type Cost,
    CostBenefit,
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
    type RecurringContractCost,
    type ReplacementCapitalCost,
    Season,
    type Type,
    type WaterCost,
} from "blcc-format/Format";
import AppliedCheckboxes from "components/AppliedCheckboxes";
import { Button, ButtonType } from "components/input/Button";
import { Dropdown } from "components/input/Dropdown";
import TextInput, { TextInputType } from "components/input/TextInput";
import { useSubscribe } from "hooks/UseSubscribe";
import { AlternativeModel } from "model/AlternativeModel";
import { currentProject$ } from "model/Model";
import { db } from "model/db";
import { useMemo } from "react";
import { BehaviorSubject, type Observable, Subject, combineLatest, merge, sample } from "rxjs";
import { map, tap } from "rxjs/operators";
import { match } from "ts-pattern";
import { guard } from "util/Operators";

type AddCostModalProps = {
    open$: Observable<CostTypes>;
};

namespace DefaultCosts {
    type Props<T, K extends CostTypes> = Omit<T, keyof BaseCost | keyof Type<K>>;

    export const CAPITAL: Props<CapitalCost, CostTypes.CAPITAL> = {
        expectedLife: 0,
    };

    export const ENERGY: Props<EnergyCost, CostTypes.ENERGY> = {
        fuelType: FuelType.ELECTRICITY,
        costPerUnit: 0,
        annualConsumption: 0,
        unit: EnergyUnit.KWH,
    };

    export const WATER: Props<WaterCost, CostTypes.WATER> = {
        unit: LiquidUnit.GALLON,
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
    };

    export const REPLACEMENT_CAPITAL: Props<ReplacementCapitalCost, CostTypes.REPLACEMENT_CAPITAL> = {
        initialCost: 0,
    };

    export const OMR: Props<OMRCost, CostTypes.OMR> = {
        initialCost: 0,
        initialOccurrence: 0,
    };

    export const IMPLEMENTATION_CONTRACT: Props<ImplementationContractCost, CostTypes.IMPLEMENTATION_CONTRACT> = {
        occurrence: 0,
        cost: 0,
    };

    export const RECURRING_CONTRACT: Props<RecurringContractCost, CostTypes.RECURRING_CONTRACT> = {
        initialCost: 0,
        initialOccurrence: 0,
        annualRateOfChange: 0,
    };

    export const OTHER: Props<OtherCost, CostTypes.OTHER> = {
        tags: ["Other"],
        costOrBenefit: CostBenefit.COST,
        initialOccurrence: 0,
        valuePerUnit: 0,
        numberOfUnits: 0,
        unit: EnergyUnit.KWH,
    };

    export const OTHER_NON_MONETARY: Props<OtherNonMonetary, CostTypes.OTHER_NON_MONETARY> = {
        tags: ["Other Non Monetary"],
        initialOccurrence: 0,
        numberOfUnits: 0,
        unit: EnergyUnit.KWH,
    };
}

function createCostInDB([projectID, name, type, alts]: [number, string, CostTypes, Set<number>]): Promise<void> {
    console.log(type);

    return db.transaction("rw", db.costs, db.projects, db.alternatives, async () => {
        const newCost = {
            name,
            type,
            ...match(type)
                .with(CostTypes.CAPITAL, () => DefaultCosts.CAPITAL)
                .with(CostTypes.ENERGY, () => DefaultCosts.ENERGY)
                .with(CostTypes.WATER, () => DefaultCosts.WATER)
                .with(CostTypes.REPLACEMENT_CAPITAL, () => DefaultCosts.REPLACEMENT_CAPITAL)
                .with(CostTypes.OMR, () => DefaultCosts.OMR)
                .with(CostTypes.IMPLEMENTATION_CONTRACT, () => DefaultCosts.IMPLEMENTATION_CONTRACT)
                .with(CostTypes.RECURRING_CONTRACT, () => DefaultCosts.RECURRING_CONTRACT)
                .with(CostTypes.OTHER, () => DefaultCosts.OTHER)
                .with(CostTypes.OTHER_NON_MONETARY, () => DefaultCosts.OTHER_NON_MONETARY)
                .exhaustive(),
        } as Cost;

        // Add new cost to DB and get new ID
        const newID = await db.costs.add(newCost);

        // Add new cost ID to project
        await db.projects
            .where("id")
            .equals(projectID)
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
    });
}

export default function AddCostModal({ open$ }: AddCostModalProps) {
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
    ] = useMemo(() => {
        const sName$ = new BehaviorSubject<string | undefined>(undefined);
        const sAddClick$ = new Subject<void>();
        const sCancelClick$ = new Subject<void>();
        const sType$ = new BehaviorSubject<CostTypes>(CostTypes.ENERGY);
        const sCheckAlt$ = new Subject<Set<ID>>();

        // Create the new cost in the DB
        const newCost$ = combineLatest([currentProject$, sName$.pipe(guard()), sType$, sCheckAlt$]).pipe(
            sample(sAddClick$),
            tap(createCostInDB),
        );

        const [modalCancel$, cancel] = createSignal();
        const [useOpen, isOpen$] = bind(
            merge(open$.pipe(map(() => true)), merge(sCancelClick$, newCost$, modalCancel$).pipe(map(() => false))),
            false,
        );

        const [disableAdd] = bind(sName$.pipe(map((name) => name === "" || name === undefined)), true);
        const [defaultChecked] = bind(AlternativeModel.sID$.pipe(map((id) => [id])), []);

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
        ];
    }, [open$]);

    useSubscribe(open$, sType$);

    //Clear fields when modal closes
    useSubscribe(isOpen$, (open) => {
        if (open) return;

        sName$.next(undefined);
        sType$.next(CostTypes.ENERGY);
    });

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
                <TextInput type={TextInputType.PRIMARY} wire={sName$} />
            </div>
            <br />
            <div className="w-full">
                <Typography.Title level={5}>Add to Alternatives</Typography.Title>
                <AppliedCheckboxes defaults={defaultChecked()} wire={sCheckAlt$} />
            </div>
            <br />
            <div>
                <Typography.Title level={5}>Cost Category</Typography.Title>
                <Dropdown className={"w-full"} options={Object.values(CostTypes)} wire={sType$} />
            </div>
        </Modal>
    );
}
