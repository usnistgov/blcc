import type { Cost } from "blcc-format/Format";
import Recurring from "components/Recurring";
import { CostModel } from "model/CostModel";
import { Strings } from "constants/Strings";
import * as O from "optics-ts";
import { isOMRCost } from "model/Guards";
import { Var } from "util/var";
import { TestNumberInput } from "components/input/TestNumberInput";

namespace OMRCostModel {
    const costOptic = O.optic<Cost>().guard(isOMRCost);

    export const initialCost = new Var(CostModel.cost, costOptic.prop("initialCost"));
    export const initialOccurrence = new Var(CostModel.cost, costOptic.prop("initialOccurrence"));

    export namespace Actions {
        export function setInitialCost(value: number | null) {
            if (value !== null) initialCost.set(value);
        }

        export function setInitialOccurrence(value: number | null) {
            if (value !== null) initialOccurrence.set(value);
        }
    }
}

/**
 * Component for the OMR fields for a cost
 */
export default function OMRCostFields() {
    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    controls
                    id={"initial-cost"}
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    getter={OMRCostModel.initialCost.use}
                    onChange={OMRCostModel.Actions.setInitialCost}
                    info={Strings.INITIAL_COST_INFO}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    getter={OMRCostModel.initialOccurrence.use}
                    onChange={OMRCostModel.Actions.setInitialOccurrence}
                    info={Strings.INITIAL_OCCURRENCE_AFTER_SERVICE}
                />
            </div>
            <Recurring showUnit={false} />
        </div>
    );
}
