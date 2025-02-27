import { Text, View } from "@react-pdf/renderer";
import type { ReplacementCapitalCost } from "blcc-format/Format";
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
} from "components/pdf/components/CostComponents";
import { styles } from "components/pdf/pdfStyles";
import ResidualValue from "./ResidualValue";
import { LabeledText } from "./components/GeneralComponents";

type ReplacementCapitalCostInputProps = {
    cost: ReplacementCapitalCost;
    year: number;
};

export default function ReplacementCapitalCostInput({ cost, year }: ReplacementCapitalCostInputProps) {
    console.log(cost);
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            <CostSavings cost={cost} />

            <InitialCost cost={cost} />

            <InitialOccurence cost={cost} />

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
