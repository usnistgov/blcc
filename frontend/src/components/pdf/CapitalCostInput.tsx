import { Text, View } from "@react-pdf/renderer";
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
} from "./CostComponents";
import { styles } from "./pdfStyles";

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
                <View style={styles.key}>
                    <Text style={styles.text}>Amount Financed:&nbsp;</Text>
                    <Text style={styles.value}> ${cost?.amountFinanced}</Text>
                </View>
            ) : null}

            <ExpectedLife cost={cost} />

            <AnnualRateOfChange cost={cost} />

            <CostAdjustmentFactor cost={cost} />

            <View style={styles.key}>
                <Text style={styles.text}>Residual Value:&nbsp;</Text>
                <Text style={styles.value}> {cost?.residualValue ? "Yes" : "No"}</Text>
            </View>

            {cost?.residualValue ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Residual Value:&nbsp;</Text>
                    <Text style={styles.value}>
                        {cost?.residualValue?.value}
                        {cost?.residualValue?.approach}
                    </Text>
                </View>
            ) : null}

            <PhaseIn cost={cost} year={year} />
        </View>
    );
}
