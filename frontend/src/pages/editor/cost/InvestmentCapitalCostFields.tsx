import { Defaults } from "blcc-format/Defaults";
import { ValueRateOfChange } from "components/Recurring";
import ResidualValue from "components/ResidualValue";
import PhaseIn from "components/grids/PhaseIn";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import { CapitalCostModel } from "model/costs/CapitalCostModel";
import { calculateNominalPercentage } from "util/Util";

export default function InvestmentCapitalCostFields() {
    const constructionPeriod = Model.constructionPeriod.use();
    const isSavings = CostModel.costOrSavings.use();
    const inflation = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;
    const isDollarMethodCurrent = Model.useIsDollarMethodCurrent();
    const costAdjustmentFactor = calculateNominalPercentage(
        CapitalCostModel.useCostAdjustmentFactor() ?? 0,
        inflation ?? Defaults.INFLATION_RATE,
        isDollarMethodCurrent,
    );

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_COST_INFO}
                    addonBefore={"$"}
                    controls
                    label={isSavings ? "Initial Cost Savings*" : "Initial Cost*"}
                    subLabel={"(Base Year Dollars)"}
                    getter={CapitalCostModel.initialCost.use}
                    onChange={CapitalCostModel.Actions.setInitialCost}
                    error={CapitalCostModel.initialCost.useValidation}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.AMOUNT_FINANCED}
                    addonBefore={"$"}
                    controls
                    label={"Amount Financed"}
                    getter={CapitalCostModel.amountFinanced.use}
                    onChange={CapitalCostModel.Actions.setAmountFinanced}
                />

                <TestNumberInput
                    className={"w-full"}
                    id={"expected-lifetime"}
                    info={Strings.EXPECTED_LIFETIME_INFO}
                    addonAfter={"years"}
                    controls
                    label={"Expected Lifetime*"}
                    getter={CapitalCostModel.expectedLife.use}
                    onChange={CapitalCostModel.Actions.setExpectedLife}
                    error={CapitalCostModel.expectedLife.useValidation}
                />
                <TestNumberInput
                    className={"w-full"}
                    id={"cost-adjustment-factor"}
                    info={Strings.COST_ADJUSTMENT_FACTOR}
                    addonAfter={"%"}
                    controls
                    label={constructionPeriod > 0 ? "Cost Adjustment Factor*" : "Cost Adjustment Factor"}
                    subLabel={"for phased-in investments"}
                    getter={() => costAdjustmentFactor}
                    onChange={(val) =>
                        CapitalCostModel.Actions.setCostAdjustmentFactor(val ?? 0, inflation, isDollarMethodCurrent)
                    }
                />
                <ValueRateOfChange />
            </div>

            <ResidualValue />
            <PhaseIn />
        </div>
    );
}
