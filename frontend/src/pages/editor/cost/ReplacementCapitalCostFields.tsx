import { useStateObservable } from "@react-rxjs/core";
import type { Cost } from "blcc-format/Format";
import ResidualValue from "components/ResidualValue";
import { TestNumberInput } from "components/input/TestNumberInput";
import { CostModel } from "model/CostModel";
import { isReplacementCapitalCost } from "model/Guards";
import { Var } from "model/Model";
import * as O from "optics-ts";

namespace Model {
    const costOptic = O.optic<Cost>().guard(isReplacementCapitalCost);

    export const initialCost = new Var(CostModel.DexieCostModel, costOptic.prop("initialCost"));
    export const initialOccurrence = new Var(CostModel.DexieCostModel, costOptic.prop("initialOccurrence"));
    export const annualRateOfChange = new Var(CostModel.DexieCostModel, costOptic.prop("annualRateOfChange"));
    export const expectedLife = new Var(CostModel.DexieCostModel, costOptic.prop("expectedLife"));

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
    const isSavings = useStateObservable(CostModel.costSavings$);

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
                />
                <TestNumberInput
                    className={"w-full"}
                    addonBefore={"year"}
                    controls
                    label={"Initial Occurrence"}
                    getter={Model.initialOccurrence.use}
                    onChange={Model.Actions.setInitialOccurrence}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    label={"Annual Rate of Change"}
                    getter={Model.annualRateOfChange.use}
                    onChange={Model.Actions.setAnnualRateOfChange}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Expected Lifetime"}
                    getter={Model.expectedLife.use}
                    onChange={Model.Actions.setExpectedLife}
                />
            </div>

            <ResidualValue />
        </div>
    );
}
