import { Text, View } from "@react-pdf/renderer";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    PhaseIn,
    RateOfRecurrence,
    Recurring
} from "./CostComponents";
import InputTable from "./InputTable";
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

            {cost?.amountFinanced ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Amount Financed:&nbsp;</Text>
                    <Text style={styles.value}> ${cost?.amountFinanced}</Text>
                </View>
            ) : null}

            <AnnualRateOfChange cost={cost} />

            {cost?.expectedLife ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Expected Lifetime:&nbsp;</Text>
                    <Text style={styles.value}> {cost.expectedLife} year(s)</Text>
                </View>
            ) : null}

            {cost?.costAdjustment ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Cost Adjustment Factor:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.costAdjustment}%</Text>
                </View>
            ) : null}

            <PhaseIn cost={cost} year={year} />

            {cost?.rateOfRecurrence ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Rate Of Recurrence:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.rateOfRecurrence} year(s)</Text>
                </View>
            ) : null}

            <RateOfRecurrence cost={cost} />

            <Recurring cost={cost} />

            {cost?.recurring ? (
                <>
                    <View style={styles.key}>
                        <Text style={styles.text}>Rate Of Recurrence:&nbsp;</Text>
                        <Text style={styles.value}> {cost?.recurring?.rateOfRecurrence} year(s)</Text>
                    </View>
                    <View style={styles.key}>
                        <Text style={styles.text}>Rate Of Change of Value:&nbsp;</Text>

                        {Array.isArray(cost?.recurring?.rateOfChangeValue) ? (
                            <InputTable
                                cost={cost}
                                header={"Value Rate of Change (%)"}
                                inputRows={cost?.recurring?.rateOfChangeValue}
                                year={year}
                            />
                        ) : (
                            <Text style={styles.value}> {cost?.recurring?.rateOfChangeValue}</Text>
                        )}
                    </View>
                </>
            ) : null}

            {cost?.residualValue ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Residual Value:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.residualValue ? "Yes" : "No"}</Text>
                </View>
            ) : null}

            {cost?.residualValue ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Residual Value:&nbsp;</Text>
                    <Text style={styles.value}>
                        {cost?.residualValue?.value}
                        {cost?.residualValue?.approach}
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

export default CapitalCostInput;
