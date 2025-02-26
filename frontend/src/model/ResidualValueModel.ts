import { bind } from "@react-rxjs/core";
import { type CapitalCost, DollarOrPercent, type ReplacementCapitalCost } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isResidualValueCost } from "model/Guards";
import * as O from "optics-ts";
import { map } from "rxjs";
import { guard } from "util/Operators";
import { toDecimal, toPercentage } from "util/Util";
import { Var } from "util/var";

export namespace ResidualValueModel {
    // Residual value optic
    const residualValueOptic = O.optic<CapitalCost | ReplacementCapitalCost>().guard(isResidualValueCost);

    export const residualValue = new Var(CostModel.cost, residualValueOptic.prop("residualValue"));
    export const [hasResidualValue] = bind(
        residualValue.$.pipe(map((residualValue) => residualValue !== undefined)),
        false,
    );

    export const approach = new Var(
        CostModel.cost,
        residualValueOptic.prop("residualValue").optional().prop("approach"),
    );

    // Value var
    export const value = new Var(CostModel.cost, residualValueOptic.prop("residualValue").optional().prop("value"));
    export const [useValuePercent] = bind(value.$.pipe(guard(), map(toPercentage)));

    export namespace Actions {
        export function toggle(toggle: boolean) {
            if (toggle)
                residualValue.set({
                    approach: DollarOrPercent.DOLLAR,
                    value: 0,
                });
            else residualValue.set(undefined);
        }

        /**
         * Sets the value of the residual value. If the approach is percent, convert to decimal first.
         *
         * @param valuePercent the value to change to
         * @param approach the current approach
         */
        export function setValue(valuePercent: number | null, approach: DollarOrPercent) {
            if (valuePercent === null) return;

            if (approach === DollarOrPercent.PERCENT) value.set(toDecimal(valuePercent));
            else if (approach === DollarOrPercent.DOLLAR) value.set(valuePercent);
        }

        /**
         * Sets the approach of the residual value. If the current approach is the same as the new approach, do nothing.
         * If the new approach is percent, convert the current value to decimal.
         * If the new approach is dollar, convert the current value to percent.
         *
         * @param current The current approach.
         * @param newApproach The approach to change to.
         * @param currentValue The current residual value that may need to be converted to decimal/percent.
         */
        export function setApproach(current: DollarOrPercent, newApproach: DollarOrPercent, currentValue: number) {
            if (newApproach === current) return;

            if (newApproach === DollarOrPercent.DOLLAR) {
                value.set(toPercentage(currentValue));
                approach.set(newApproach);
            } else if (newApproach === DollarOrPercent.PERCENT) {
                value.set(toDecimal(currentValue));
                approach.set(newApproach);
            }
        }
    }
}
