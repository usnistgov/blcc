import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import type { Cost } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isRateOfChangeUnitCost, isRateOfChangeValueCost, isRecurringCost } from "model/Guards";
import { Model } from "model/Model";
import * as O from "optics-ts";
import { combineLatestWith, filter, map } from "rxjs/operators";
import { isConstant as isConstantOp, sampleMany } from "util/Operators";
import { calculateRealDecimal, makeArray, toDecimal } from "util/Util";
import { Var } from "util/var";
import { z } from "zod";

export type RateChangeInfo = {
    year: number;
    rate: number;
};

/**
 * Convert an array of year-over-year rate changes into an array of RateChangeInfo objects.
 * @param [changes, releaseYear] An array of rate changes and the release year.
 * @returns An array of RateChangeInfo objects.
 */
function toRateChangeInfo([changes, releaseYear]: [number[], number]): RateChangeInfo[] {
    return changes.map((rate, i) => ({
        year: releaseYear + i,
        rate,
    }));
}

export namespace RecurringModel {
    const rateofChangeUnitCostOptic = O.optic<Cost>().guard(isRateOfChangeUnitCost);
    const rateOfChangeCostOptic = O.optic<Cost>().guard(isRateOfChangeValueCost);
    const recurringOptic = O.optic<Cost>().guard(isRecurringCost).prop("recurring");

    export const recurring = new Var(CostModel.cost, recurringOptic);

    /**
     * True if the current cost is a recurring cost.
     */
    export const [isRecurring] = bind(recurring.$.pipe(map((recurring) => !!recurring)));

    /**
     * The rate of recurrence for the current recurring cost.
     */
    export const rateOfRecurrence = new Var(CostModel.cost, recurringOptic.optional().prop("rateOfRecurrence"));

    export namespace Duration {
        export const duration = new Var(CostModel.cost, recurringOptic.optional().prop("duration"), z.number());

        export const [setDefaultArray$, setDefaultArray] = createSignal();
        sampleMany(setDefaultArray$, [Model.studyPeriod.$, Model.constructionPeriod.$, duration.$]).subscribe(
            ([studyPeriod, constructionPeriod, oldDuration]) =>
                duration.set(oldDuration ?? (studyPeriod ?? 0) + constructionPeriod),
        );

        export namespace Actions {
            /**
             * Set the duration. Value is assumed to be in years.
             * @param value The value duration is set to, in years.
             */
            export function setValue(value: number | null) {
                if (value !== null) Duration.duration.set(value);
            }
        }
    }

    export namespace Value {
        /**
         * The value of the rate of change of the recurring cost.
         * Either a constant value or an array of values for each year.
         */
        export const rate = new Var(CostModel.cost, rateOfChangeCostOptic.optional().prop("rateOfChangeValue"));

        /**
         * Is the value of the rate of change constant.
         *
         * If true, the value is constant across the entire period.
         * If false, the value will be an array of values for each year.
         */
        export const [isConstant] = bind(rate.$.pipe(isConstantOp()));

        export const [setDefaultArray$, setDefaultArray] = createSignal();
        sampleMany(setDefaultArray$, [Model.studyPeriod.$, Model.constructionPeriod.$, rate.$]).subscribe(
            ([studyPeriod, constructionPeriod, oldRate]) =>
                rate.set(makeArray((studyPeriod ?? 0) + constructionPeriod, (oldRate ?? 0) as number)),
        );

        export const [gridValues] = bind(
            rate.$.pipe(
                filter<number | number[] | undefined, number[]>(Array.isArray),
                combineLatestWith(Model.releaseYear.$),
                map(toRateChangeInfo),
            ),
        );

        export namespace Actions {
            /**
             * Set the constant value rate of change. Value is assumed to be in percent.
             * @param value The value rate of change in percentage to set to.
             */
            export function setConstant(value: number | null, inflation: number, isDollarMethodCurrent: boolean) {
                if (value !== null) Value.rate.set(calculateRealDecimal(value, inflation, isDollarMethodCurrent));
            }

            export function setArray(rows: RateChangeInfo[]) {
                Value.rate.set(rows.map((row) => row.rate));
            }

            export function toggle(isConstant: boolean) {
                const rates = rate.current();
                if (isConstant) Value.rate.set((rates as number[])[0] ?? 0);
                else Value.setDefaultArray();
            }
        }
    }

    export namespace Units {
        export const rate = new Var(
            CostModel.cost,
            rateofChangeUnitCostOptic.guard(isRateOfChangeUnitCost).prop("rateOfChangeUnits"),
        );

        export const [isConstant] = bind(rate.$.pipe(isConstantOp()));

        export const [setDefaultArray$, setDefaultArray] = createSignal();
        sampleMany(setDefaultArray$, [Model.studyPeriod.$, Model.constructionPeriod.$, rate.$]).subscribe(
            ([studyPeriod, constructionPeriod, oldRate]) =>
                rate.set(makeArray((studyPeriod ?? 0) + constructionPeriod + 1, oldRate as number)),
        );

        export const [gridValues] = bind(
            rate.$.pipe(
                filter<number | number[] | undefined, number[]>(Array.isArray),
                combineLatestWith(Model.releaseYear.$),
                map(toRateChangeInfo),
            ),
        );

        export namespace Actions {
            export function setConstant(value: number | null) {
                if (value !== null) Units.rate.set(toDecimal(value));
            }

            export function setArray(rows: RateChangeInfo[]) {
                Units.rate.set(rows.map((row) => row.rate));
            }

            export function toggle(isConstant: boolean) {
                const rates = rate.current();
                if (isConstant) Units.rate.set((rates as number[])[0] ?? 0);
                else Units.setDefaultArray();
            }
        }
    }

    export namespace Actions {
        /**
         * Toggles the recurring state of this cost.
         *
         * @param recurring - A boolean indicating if the cost is recurring. If false,
         *                    the recurring state is unset.
         * @param showValue - A boolean indicating whether to set the constant value rate
         *                   of change. This is only applicable if `recurring` is true.
         *                   If true, the constant unit rate of change is set to 0.
         */
        export function toggleRecurring(recurring: boolean) {
            // If not recurring, unset the recurring state
            if (!recurring) {
                RecurringModel.recurring.set(undefined);
                return;
            }

            // Otherwise, set the default recurring state
            RecurringModel.recurring.set({
                rateOfRecurrence: 0,
            });
        }

        /**
         * Sets the rate of recurrence for this recurring cost.
         *
         * @param value - The new rate of recurrence. If null, does nothing.
         */
        export function setRateOfRecurrence(value: number | null) {
            if (value !== null) RecurringModel.rateOfRecurrence.set(value);
        }
    }
}
