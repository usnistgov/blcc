import { shareLatest, state } from "@react-rxjs/core";
import type { SelectProps } from "antd";
import {
    CostTypes,
    CubicUnit,
    EnergyUnit,
    LiquidUnit,
    type OtherCost,
    type OtherNonMonetary,
    type Unit,
    WeightUnit,
} from "blcc-format/Format";
import type { OptionType } from "components/SelectOrCreate";
import { liveQuery } from "dexie";
import { CostModel } from "model/CostModel";
import { OtherNonMonetaryCostModel } from "model/costs/OtherNonMonetaryCostModel";
import { db } from "model/db";
import { type Observable, Subject, distinctUntilChanged, from, merge } from "rxjs";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";

export namespace OtherCostModel {
    /**
     * The cost stream narrowed to an OtherCost
     */
    export const cost$ = CostModel.cost$.pipe(filter((cost): cost is OtherCost => cost.type === CostTypes.OTHER));

    /**
     * Gets a list of all the tags for all Other and Other Non-monetary costs.
     */
    export const allTags$ = state(
        from(
            liveQuery(() =>
                // Get all Other and Other Non-monetary costs from the DB
                db.costs
                    .where("type")
                    .equals(CostTypes.OTHER)
                    .or("type")
                    .equals(CostTypes.OTHER_NON_MONETARY)
                    .toArray(),
            ),
        ).pipe(
            // Combine into a set to get rid of all duplicates
            map((costs) => new Set((costs as (OtherCost | OtherNonMonetary)[]).flatMap((cost) => cost.tags ?? []))),
            // Convert into the format that the ant select input requires
            map((tags): SelectProps["options"] => [...tags].map((tag) => ({ value: tag, label: tag }))),
        ),
        [],
    );

    /**
     * The tags for the current other cost
     */
    export const sTags$ = new Subject<string[]>();
    export const tags$ = state(merge(sTags$, cost$.pipe(map((cost) => cost.tags))).pipe(distinctUntilChanged()), []);
    sTags$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([tags, collection]) => collection.modify({ tags }));

    /**
     * The initial occurrence for the current other cost
     */
    export const sInitialOccurrence$ = new Subject<number>();
    export const initialOccurrence$ = state(
        merge(sInitialOccurrence$, cost$.pipe(map((cost) => cost.initialOccurrence))).pipe(distinctUntilChanged()),
        0,
    );
    sInitialOccurrence$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([initialOccurrence, collection]) => collection.modify({ initialOccurrence }));

    const defaultUnits = [
        ...Object.values(EnergyUnit),
        ...Object.values(CubicUnit),
        ...Object.values(LiquidUnit),
        ...Object.values(WeightUnit),
    ];
    export const allUnits$: Observable<OptionType[]> = from(
        liveQuery(() =>
            db.costs.where("type").equals(CostTypes.OTHER).or("type").equals(CostTypes.OTHER_NON_MONETARY).toArray(),
        ),
    ).pipe(
        map(
            (costs) =>
                new Set([
                    ...(costs as (OtherCost | OtherNonMonetary)[])
                        .filter((cost) => cost.unit !== undefined)
                        .map((cost) => cost.unit ?? ""),
                    ...defaultUnits,
                ]),
        ),
        map((units) => [...units].map((unit) => ({ value: unit, label: unit }))),
    );

    /**
     * The unit of the current cost
     */
    export const sUnit$ = new Subject<string | Unit>();
    export const unit$ = state(
        merge(sUnit$, cost$.pipe(map((cost) => cost.unit))).pipe(distinctUntilChanged()),
        undefined,
    );
    sUnit$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([unit, collection]) => collection.modify({ unit }));

    /**
     *  The number of units in the current other cost
     */
    export const sNumberOfUnits$ = new Subject<number>();
    export const numberOfUnits$ = state(
        merge(sNumberOfUnits$, cost$.pipe(map((cost) => cost.numberOfUnits))).pipe(distinctUntilChanged()),
        0,
    );
    sNumberOfUnits$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([numberOfUnits, collection]) => collection.modify({ numberOfUnits }));

    /**
     * The value of each unit
     */
    export const sValuePerUnit$ = new Subject<number>();
    export const valuePerUnit$ = state(
        merge(sValuePerUnit$, cost$.pipe(map((cost) => cost.valuePerUnit))).pipe(distinctUntilChanged()),
        0,
    );
    sValuePerUnit$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([valuePerUnit, collection]) => collection.modify({ valuePerUnit }));
}
