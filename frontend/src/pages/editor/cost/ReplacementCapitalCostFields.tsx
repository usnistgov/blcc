import type { Cost } from "blcc-format/Format";
import ResidualValue from "components/ResidualValue";
import { TestNumberInput } from "components/input/TestNumberInput";
import { CostModel } from "model/CostModel";
import { isReplacementCapitalCost } from "model/Guards";
import * as O from "optics-ts";
import { Var } from "util/var";
import { Strings } from "../../../constants/Strings";
import { calculateNominalPercentage, calculateRealDecimal } from "util/Util";
import { Model } from "model/Model";
import { Defaults } from "blcc-format/Defaults";
import { z } from "zod";

namespace ReplacementModel {
    const costOptic = O.optic<Cost>().guard(isReplacementCapitalCost);

    export const initialCost = new Var(CostModel.cost, costOptic.prop("initialCost"), z.number());
    export const initialOccurrence = new Var(
        CostModel.cost,
        costOptic.prop("initialOccurrence"),
        z.number().min(1, { message: Strings.MUST_BE_AT_LEAST_ONE }),
    );
    export const annualRateOfChange = new Var(CostModel.cost, costOptic.prop("rateOfChangeValue"));
    export const expectedLife = new Var(
        CostModel.cost,
        costOptic.prop("expectedLife"),
        z.number().min(1, { message: Strings.MUST_BE_AT_LEAST_ONE }),
    );

    export namespace Actions {
        export function setInitialCost(change: number | null) {
            if (change !== null) initialCost.set(change);
        }

        export function setInitialOccurrence(change: number | null) {
            if (change !== null) initialOccurrence.set(change);
        }

        export function setAnnualRateOfChange(
            change: number | null,
            inflation: number,
            isDollarMethodCurrent: boolean,
        ) {
            if (change !== null)
                annualRateOfChange.set(calculateRealDecimal(change ?? 0, inflation, isDollarMethodCurrent));
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
    const inflation = Model.inflationRate.use();
    const annualRateOfChange = ReplacementModel.annualRateOfChange.use();
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();
    const initialOccurenceWarning =
        ReplacementModel.initialOccurrence.use() > (Model.studyPeriod.use() ?? 0) + Model.constructionPeriod.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    controls
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    getter={ReplacementModel.initialCost.use}
                    onChange={ReplacementModel.Actions.setInitialCost}
                    error={ReplacementModel.initialCost.useValidation}
                    info={Strings.INITIAL_COST_INFO}
                    tooltip={Strings.INITIAL_COST_TOOLTIP}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    getter={ReplacementModel.initialOccurrence.use}
                    onChange={ReplacementModel.Actions.setInitialOccurrence}
                    info={Strings.INITIAL_OCCURRENCE_AFTER_SERVICE}
                    error={ReplacementModel.initialOccurrence.useValidation}
                    warning={initialOccurenceWarning ? "Warning: exceeds study period" : undefined}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    label={"Annual Rate of Change"}
                    getter={() =>
                        calculateNominalPercentage(
                            annualRateOfChange ?? 0,
                            inflation ?? Defaults.INFLATION_RATE,
                            isDollarMethodCurrent,
                        )
                    }
                    onChange={(val) =>
                        ReplacementModel.Actions.setAnnualRateOfChange(
                            val,
                            inflation ?? Defaults.INFLATION_RATE,
                            isDollarMethodCurrent,
                        )
                    }
                    info={Strings.ANNUAL_RATE_OF_CHANGE}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Expected Lifetime*"}
                    getter={ReplacementModel.expectedLife.use}
                    onChange={ReplacementModel.Actions.setExpectedLife}
                    info={Strings.EXPECTED_LIFETIME_INFO}
                    tooltip={Strings.EXPECTED_LIFETIME_TOOLTIP}
                    error={ReplacementModel.expectedLife.useValidation}
                />
            </div>

            <ResidualValue />
        </div>
    );
}
