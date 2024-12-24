import { Text, View } from "@react-pdf/renderer";
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
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring
} from "./CostComponents";
import { styles } from "./pdfStyles";

const CapitalCostInput = (props: { cost; year: number }) => {
    //TODO: specify type for cost
    const { cost, year } = props;
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

            <Recurring cost={cost} />

            {cost?.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} />
                    <RateOfChangeValue cost={cost} year={year} />
                    <RateOfChangeUnits cost={cost} year={year} />
                </>
            ) : null}
            <PhaseIn cost={cost} year={year} />
        </View>
    );
};

export default CapitalCostInput;
