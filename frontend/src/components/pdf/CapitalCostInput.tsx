import { View } from "@react-pdf/renderer";
import type { CapitalCost } from "blcc-format/Format";
import {
    AnnualRateOfChange,
    CostAdjustmentFactor,
    CostName,
    CostSavings,
    Description,
    ExpectedLife,
    InitialCost,
    InitialOccurence,
    PhaseIn,
} from "./components/CostComponents";
import { dollarFormatter } from "util/Util";
import ResidualValue from "./ResidualValue";
import { LabeledText } from "./components/GeneralComponents";

type CapitalCostInputProps = {
    cost: CapitalCost;
    year: number;
};

export default function CapitalCostInput({ cost, year }: CapitalCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            <CostSavings cost={cost} />

            <InitialCost cost={cost} />

            <InitialOccurence cost={cost} />

            {cost?.amountFinanced ? (
                <LabeledText label="Amount Financed:" text={dollarFormatter.format(cost?.amountFinanced)} />
            ) : null}

            <ExpectedLife cost={cost} />

            <AnnualRateOfChange cost={cost} />

            <CostAdjustmentFactor cost={cost} />

            <LabeledText label="Residual Value" text={cost?.residualValue ? "Yes" : "No"} />

            {cost?.residualValue ? (
                <ResidualValue residualValue={cost?.residualValue.value} approach={cost.residualValue.approach} />
            ) : null}

            <PhaseIn cost={cost} year={year} />
        </View>
    );
}
