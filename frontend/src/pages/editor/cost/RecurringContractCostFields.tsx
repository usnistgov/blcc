import type { Cost } from "blcc-format/Format";
import { DurationInput, RateOfRecurrenceInput, ValueRateOfChange } from "components/Recurring";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { isRecurringContractCost } from "model/Guards";
import { Model } from "model/Model";
import * as O from "optics-ts";
import { Var } from "util/var";
import { z } from "zod";

namespace RecurringContractModel {
    const costOptic = O.optic<Cost>().guard(isRecurringContractCost);

    export const initialCost = new Var(CostModel.cost, costOptic.prop("initialCost"), z.number());

    export const initialOccurrence = new Var(
        CostModel.cost,
        costOptic.prop("initialOccurrence"),
        z.number().min(1, { message: Strings.MUST_BE_AT_LEAST_ONE }),
    );

    export namespace Actions {
        export function setInitialCost(change: number | null) {
            if (change !== null) initialCost.set(change);
        }

        export function setInitialOccurrence(change: number | null) {
            if (change !== null) initialOccurrence.set(change);
        }
    }
}

export default function RecurringContractCostFields() {
    const isSavings = CostModel.costOrSavings.use();
    const initialOccurenceWarning =
        RecurringContractModel.initialOccurrence.use() >
        (Model.studyPeriod.use() ?? 0) + Model.constructionPeriod.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_COST_INFO}
                    addonBefore={"$"}
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    getter={RecurringContractModel.initialCost.use}
                    onChange={RecurringContractModel.Actions.setInitialCost}
                    error={RecurringContractModel.initialCost.useValidation}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_OCCURRENCE}
                    addonAfter={"years"}
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    precision={0}
                    getter={RecurringContractModel.initialOccurrence.use}
                    onChange={RecurringContractModel.Actions.setInitialOccurrence}
                    error={RecurringContractModel.initialOccurrence.useValidation}
                    warning={initialOccurenceWarning ? "Warning: exceeds study period" : undefined}
                />
                <RateOfRecurrenceInput showLabel />

                {/* Second row */}
                <ValueRateOfChange />
                <DurationInput />
            </div>
        </div>
    );
}
