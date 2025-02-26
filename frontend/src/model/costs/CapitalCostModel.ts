import { bind } from "@react-rxjs/core";
import type { CapitalCost } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isCapital } from "model/Guards";
import * as O from "optics-ts";
import { map } from "rxjs/operators";
import { guard } from "util/Operators";
import { toDecimal, toPercentage } from "util/Util";
import { Var } from "util/var";

export namespace CapitalCostModel {
    const capitalCostOptic = O.optic<CapitalCost>().guard(isCapital);

    //Initial Cost
    export const initialCost = new Var(CostModel.cost, capitalCostOptic.prop("initialCost"));

    // Annual Rate of Change
    export const annualRateOfChange = new Var(CostModel.cost, capitalCostOptic.prop("annualRateOfChange"));
    export const [useAnnualRateOfChangePercentage] = bind(
        annualRateOfChange.$.pipe(guard(), map(toPercentage)),
        undefined,
    );

    // Expected Lifetime
    export const expectedLife = new Var(CostModel.cost, capitalCostOptic.prop("expectedLife"));

    // Cost Adjustment Factor
    export const costAdjustmentFactor = new Var(CostModel.cost, capitalCostOptic.prop("costAdjustment"));
    export const [useCostAdjustmentFactorPercentage] = bind(
        costAdjustmentFactor.$.pipe(guard(), map(toPercentage)),
        undefined,
    );

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
        export function setAnnualRateOfChange(newAnnualRateOfChangePercent: number | null) {
            if (newAnnualRateOfChangePercent === null) annualRateOfChange.set(undefined);
            else annualRateOfChange.set(toDecimal(newAnnualRateOfChangePercent));
        }

        /**
         * Sets the cost adjustment factor to the given value. If the value is null, sets the cost adjustment factor to undefined.
         */
        export function setCostAdjustmentFactor(newCostAdjustmentFactorPercent: number | null) {
            if (newCostAdjustmentFactorPercent === null) costAdjustmentFactor.set(undefined);
            else costAdjustmentFactor.set(toDecimal(newCostAdjustmentFactorPercent));
        }

        /**
         * Sets the phase in to the given values.
         */
        export function setPhaseIn(newPhaseIn: number[]) {
            phaseIn.set(newPhaseIn);
        }
    }
}
