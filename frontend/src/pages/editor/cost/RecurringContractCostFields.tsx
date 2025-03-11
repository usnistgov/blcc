import type { Cost } from "blcc-format/Format";
import { RateOfRecurrenceInput, ValueRateOfChange } from "components/Recurring";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { isRecurringContractCost } from "model/Guards";
import * as O from "optics-ts";
import { Var } from "util/var";

namespace Model {
    const costOptic = O.optic<Cost>().guard(isRecurringContractCost);

    export const initialCost = new Var(CostModel.cost, costOptic.prop("initialCost"));

    export const initialOccurrence = new Var(CostModel.cost, costOptic.prop("initialOccurrence"));

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

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_COST_INFO}
                    addonBefore={"$"}
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    getter={Model.initialCost.use}
                    onChange={Model.Actions.setInitialCost}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_OCCURRENCE}
                    addonAfter={"years"}
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    getter={Model.initialOccurrence.use}
                    onChange={Model.Actions.setInitialOccurrence}
                />
                <RateOfRecurrenceInput showLabel />

                {/* Second row */}
                <ValueRateOfChange />
            </div>
        </div>
    );
}
