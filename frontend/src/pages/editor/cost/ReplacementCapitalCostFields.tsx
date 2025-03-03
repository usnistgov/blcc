import type { Cost } from "blcc-format/Format";
import ResidualValue from "components/ResidualValue";
import { TestNumberInput } from "components/input/TestNumberInput";
import { CostModel } from "model/CostModel";
import { isReplacementCapitalCost } from "model/Guards";
import * as O from "optics-ts";
import { Var } from "util/var";
import { Strings } from "../../../constants/Strings";

namespace Model {
    const costOptic = O.optic<Cost>().guard(isReplacementCapitalCost);

    export const initialCost = new Var(CostModel.cost, costOptic.prop("initialCost"));
    export const initialOccurrence = new Var(CostModel.cost, costOptic.prop("initialOccurrence"));
    export const annualRateOfChange = new Var(CostModel.cost, costOptic.prop("annualRateOfChange"));
    export const expectedLife = new Var(CostModel.cost, costOptic.prop("expectedLife"));

    export namespace Actions {
        export function setInitialCost(change: number | null) {
            if (change !== null) initialCost.set(change);
        }

        export function setInitialOccurrence(change: number | null) {
            if (change !== null) initialOccurrence.set(change);
        }

        export function setAnnualRateOfChange(change: number | null) {
            if (change !== null) annualRateOfChange.set(change);
            else annualRateOfChange.set(undefined);
        }

        export function setExpectedLife(change: number | null) {
            if (change !== null) expectedLife.set(change);
            else expectedLife.set(undefined);
        }
    }
}

export default function ReplacementCapitalCostFields() {
    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    controls
                    label={isSavings ? "Initial Cost Savings (Base Year Dollars)" : "Initial Cost (Base Year Dollars)"}
                    getter={Model.initialCost.use}
                    onChange={Model.Actions.setInitialCost}
                    info={Strings.INITIAL_COST_INFO}
                    tooltip={Strings.INITIAL_COST_TOOLTIP}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    getter={Model.initialOccurrence.use}
                    onChange={Model.Actions.setInitialOccurrence}
                    info={Strings.INITIAL_OCCURRENCE_AFTER_SERVICE}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    label={"Annual Rate of Change"}
                    getter={Model.annualRateOfChange.use}
                    onChange={Model.Actions.setAnnualRateOfChange}
                    info={Strings.ANNUAL_RATE_OF_CHANGE}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Expected Lifetime"}
                    getter={Model.expectedLife.use}
                    onChange={Model.Actions.setExpectedLife}
                    info={Strings.EXPECTED_LIFETIME_INFO}
                    tooltip={Strings.EXPECTED_LIFETIME_TOOLTIP}
                />
            </div>

            <ResidualValue />
        </div>
    );
}
