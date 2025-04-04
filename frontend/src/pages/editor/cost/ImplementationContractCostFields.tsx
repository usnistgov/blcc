import type { Cost } from "blcc-format/Format";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import * as O from "optics-ts";
import { TestNumberInput } from "components/input/TestNumberInput";
import { calculateNominalPercentage, calculateRealDecimal, getDefaultRateOfChange } from "util/Util";
import { Var } from "util/var";
import { isImplementationContractCost } from "model/Guards";
import { Model } from "model/Model";
import { Defaults } from "blcc-format/Defaults";
import { z } from "zod";

namespace ImplementationContractModel {
    const costOptic = O.optic<Cost>().guard(isImplementationContractCost);

    export const valueRateOfChange = new Var(CostModel.cost, costOptic.prop("valueRateOfChange"));
    export const occurrence = new Var(
        CostModel.cost,
        costOptic.prop("occurrence"),
        z.number().min(1, { message: Strings.MUST_BE_AT_LEAST_ONE }),
    );
    export const cost = new Var(CostModel.cost, costOptic.prop("cost"));

    export namespace Actions {
        export function setOccurrence(value: number | null) {
            if (value !== null) occurrence.set(value);
        }

        export function setCost(value: number | null) {
            if (value !== null) cost.set(value);
        }
    }
}

/**
 * Component for the implementation contract fields in the cost pages
 */
export default function ImplementationContractCostFields() {
    const isSavings = CostModel.costOrSavings.use();

    const defaultRateOfChange = getDefaultRateOfChange(Model.dollarMethod.current());
    const inflationRate = Model.inflationRate.use();
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();
    const initialOccurenceWarning =
        ImplementationContractModel.occurrence.use() > (Model.studyPeriod.use() ?? 0) + Model.constructionPeriod.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    getter={ImplementationContractModel.cost.use}
                    onChange={ImplementationContractModel.Actions.setCost}
                    info={Strings.INITIAL_COST_INFO}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.OCCURRENCE}
                    addonAfter={"years"}
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    getter={ImplementationContractModel.occurrence.use}
                    onChange={ImplementationContractModel.Actions.setOccurrence}
                    error={ImplementationContractModel.occurrence.useValidation}
                    warning={initialOccurenceWarning ? "Warning: exceeds study period" : undefined}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    label={"Value Rate of Change"}
                    getter={() =>
                        calculateNominalPercentage(
                            ImplementationContractModel.valueRateOfChange.use() ?? defaultRateOfChange,
                            inflationRate ?? Defaults.INFLATION_RATE,
                            isDollarMethodCurrent,
                        )
                    }
                    onChange={(val) =>
                        ImplementationContractModel.valueRateOfChange.set(
                            calculateRealDecimal(
                                val ?? defaultRateOfChange,
                                inflationRate ?? Defaults.INFLATION_RATE,
                                isDollarMethodCurrent,
                            ),
                        )
                    }
                    info={Strings.VALUE_RATE_OF_CHANGE_INFO}
                />
            </div>
        </div>
    );
}
