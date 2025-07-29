import { bind } from "@react-rxjs/core";
import type { CapitalCost } from "blcc-format/Format";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { isCapital } from "model/Guards";
import * as O from "optics-ts";
import { map } from "rxjs/operators";
import { guard } from "util/Operators";
import { calculateRealDecimal } from "util/Util";
import { Var } from "util/var";
import { z } from "zod";

export namespace CapitalCostModel {
    const capitalCostOptic = O.optic<CapitalCost>().guard(isCapital);

    //Initial Cost
    export const initialCost = new Var(CostModel.cost, capitalCostOptic.prop("initialCost"), z.number());

    // Annual Rate of Change
    export const annualRateOfChange = new Var(CostModel.cost, capitalCostOptic.prop("rateOfChangeValue"));
    export const [useAnnualRateOfChange] = bind(annualRateOfChange.$.pipe(guard()), undefined);

    // Expected Lifetime
    export const expectedLife = new Var(
        CostModel.cost,
        capitalCostOptic.prop("expectedLife"),
        z.number().min(1, { message: Strings.MUST_BE_AT_LEAST_ONE }),
    );

    // Cost Adjustment Factor
    export const costAdjustmentFactor = new Var(CostModel.cost, capitalCostOptic.prop("costAdjustment"));
    export const [useCostAdjustmentFactor] = bind(costAdjustmentFactor.$.pipe(guard()), undefined);

    // Amount Financed
    export const amountFinanced = new Var(CostModel.cost, capitalCostOptic.prop("amountFinanced"));

    // Phase In
    export const phaseIn = new Var(CostModel.cost, capitalCostOptic.prop("phaseIn"));

    export namespace Actions {
        /**
         * Sets the initial cost to the given value. If the value is null, sets the initial cost to undefined.
         */
        export function setInitialCost(newInitialCost: number | null) {
            initialCost.set(newInitialCost ?? undefined);
        }

        /**
         * Sets the amount financed to the given value. If the value is null, sets the amount financed to undefined.
         */
        export function setAmountFinanced(newAmountFinanced: number | null) {
            amountFinanced.set(newAmountFinanced ?? undefined);
        }

        /**
         * Sets the expected lifetime to the given value. If the value is null, do nothing
         */
        export function setExpectedLife(newExpectedLife: number | null) {
            if (newExpectedLife === null) return;

            expectedLife.set(newExpectedLife);
        }

        /**
         * Sets the annual rate of change to the given value. If the value is null, sets the annual rate of change to undefined.
         */
        export function setAnnualRateOfChange(
            newAnnualRateOfChangePercent: number,
            inflation: number,
            isDollarMethodCurrent: boolean,
        ) {
            if (newAnnualRateOfChangePercent === null) annualRateOfChange.set(undefined);
            else
                annualRateOfChange.set(
                    calculateRealDecimal(newAnnualRateOfChangePercent, inflation, isDollarMethodCurrent),
                );
        }

        /**
         * Sets the cost adjustment factor to the given value. If the value is null, sets the cost adjustment factor to undefined.
         */
        export function setCostAdjustmentFactor(
            newCostAdjustmentFactorPercent: number,
            inflation: number,
            isDollarMethodCurrent: boolean,
        ) {
            if (newCostAdjustmentFactorPercent === null) costAdjustmentFactor.set(undefined);
            else
                costAdjustmentFactor.set(
                    calculateRealDecimal(newCostAdjustmentFactorPercent, inflation, isDollarMethodCurrent),
                );
        }

        /**
         * Sets the phase in to the given values.
         */
        export function setPhaseIn(newPhaseIn: number[]) {
            phaseIn.set(newPhaseIn);
        }
    }
}
