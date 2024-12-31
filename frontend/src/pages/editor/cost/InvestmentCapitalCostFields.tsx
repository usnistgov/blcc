import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import { type CapitalCost, CostTypes } from "blcc-format/Format";
import ResidualValue from "components/ResidualValue";
import PhaseIn from "components/grids/PhaseIn";
import { NumberInput } from "components/input/InputNumber";
import { Strings } from "constants/Strings";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { CapitalCostModel } from "model/costs/CapitalCostModel";
import React, { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, filter, merge } from "rxjs";
import { map } from "rxjs/operators";

export default function InvestmentCapitalCostFields() {
    const isSavings = useStateObservable(CostModel.costSavings$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_COST}
                    addonBefore={"$"}
                    controls
                    allowEmpty
                    label={isSavings ? "Initial Cost Savings (Base Year Dollars)" : "Initial Cost (Base Year Dollars)"}
                    wire={CapitalCostModel.sInitialCost$}
                    value$={CapitalCostModel.initialCost$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.AMOUNT_FINANCED}
                    addonBefore={"$"}
                    controls
                    allowEmpty
                    label={"Amount Financed"}
                    wire={CapitalCostModel.sAmountFinanced$}
                    value$={CapitalCostModel.amountFinanced$}
                />

                <NumberInput
                    className={"w-full"}
                    info={Strings.EXPECTED_LIFETIME}
                    addonAfter={"years"}
                    controls
                    allowEmpty
                    label={"Expected Lifetime"}
                    wire={CapitalCostModel.sExpectedLifetime$}
                    value$={CapitalCostModel.expectedLifetime$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.ANNUAL_RATE_OF_CHANGE}
                    addonAfter={"%"}
                    controls
                    allowEmpty
                    label={"Annual Rate of Change"}
                    subLabel={"for residual value calculation"}
                    wire={CapitalCostModel.sAnnualRateOfChange$}
                    value$={CapitalCostModel.annualRateOfChange$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.COST_ADJUSTMENT_FACTOR}
                    addonAfter={"%"}
                    controls
                    allowEmpty
                    label={"Cost Adjustment Factor"}
                    subLabel={"for phased-in investments"}
                    wire={CapitalCostModel.sCostAdjustmentFactor$}
                    value$={CapitalCostModel.costAdjustmentFactor$}
                />
            </div>

            <ResidualValue />
            <PhaseIn />
        </div>
    );
}
