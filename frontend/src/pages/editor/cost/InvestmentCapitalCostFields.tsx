import ResidualValue from "components/ResidualValue";
import PhaseIn from "components/grids/PhaseIn";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { CapitalCostModel } from "model/costs/CapitalCostModel";
import React from "react";

export default function InvestmentCapitalCostFields() {
    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_COST_INFO}
                    addonBefore={"$"}
                    controls
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    getter={CapitalCostModel.initialCost.use}
                    onChange={CapitalCostModel.Actions.setInitialCost}
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
                    label={"Expected Lifetime"}
                    getter={CapitalCostModel.expectedLife.use}
                    onChange={CapitalCostModel.Actions.setExpectedLife}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.ANNUAL_RATE_OF_CHANGE}
                    addonAfter={"%"}
                    controls
                    label={"Annual Rate of Change"}
                    subLabel={"for residual value calculation"}
                    getter={CapitalCostModel.useAnnualRateOfChangePercentage}
                    onChange={CapitalCostModel.Actions.setAnnualRateOfChange}
                />
                <TestNumberInput
                    className={"w-full"}
                    id={"cost-adjustment-factor"}
                    info={Strings.COST_ADJUSTMENT_FACTOR}
                    addonAfter={"%"}
                    controls
                    label={"Cost Adjustment Factor"}
                    subLabel={"for phased-in investments"}
                    getter={CapitalCostModel.useCostAdjustmentFactorPercentage}
                    onChange={CapitalCostModel.Actions.setCostAdjustmentFactor}
                />
            </div>

            <ResidualValue />
            <PhaseIn />
        </div>
    );
}
