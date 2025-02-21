import { bind } from "@react-rxjs/core";
import type { SelectProps } from "antd";
import {
    type Cost,
    CostTypes,
    CubicUnit,
    EnergyUnit,
    LiquidUnit,
    type OtherCost,
    type OtherNonMonetary,
    WeightUnit,
} from "blcc-format/Format";
import type { OptionType } from "components/SelectOrCreate";
import { liveQuery } from "dexie";
import { CostModel } from "model/CostModel";
import { isOtherMonetary } from "model/Guards";
import { db } from "model/db";
import * as O from "optics-ts";
import { type Observable, from } from "rxjs";
import { map } from "rxjs/operators";
import { Var } from "util/var";

export namespace OtherCostModel {
    const otherCostOptic = O.optic<Cost>().guard(isOtherMonetary);

    /**
     * Gets a list of all the tags for all Other and Other Non-monetary costs.
     */
    export const [useAllTags] = bind(
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
    export const tags = new Var(CostModel.cost, otherCostOptic.prop("tags"));

    /**
     * The initial occurrence for the current other cost
     */
    export const initialOccurrence = new Var(CostModel.cost, otherCostOptic.prop("initialOccurrence"));

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
    export const unit = new Var(CostModel.cost, otherCostOptic.prop("unit"));

    /**
     *  The number of units in the current other cost
     */
    export const numberOfUnits = new Var(CostModel.cost, otherCostOptic.prop("numberOfUnits"));

    /**
     * The value of each unit
     */
    export const valuePerUnit = new Var(CostModel.cost, otherCostOptic.prop("valuePerUnit"));

    export namespace Actions {
        export function setInitialOccurrence(value: number | null) {
            if (value !== null) initialOccurrence.set(value);
        }

        export function setNumberOfUnits(value: number | null) {
            if (value !== null) numberOfUnits.set(value);
        }

        export function setValuePerUnit(value: number | null) {
            if (value !== null) valuePerUnit.set(value);
        }
    }
}
