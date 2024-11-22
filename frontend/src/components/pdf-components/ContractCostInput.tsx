import { Text, View } from "@react-pdf/renderer";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    RateOfRecurrence,
    Recurring
} from "./CostComponents";
import InputTable from "./InputTable";
import { styles } from "./pdfStyles";

const ContractCostInput = (props: { cost; year: number }) => {
    //TODO: specify type for cost
    const { cost, year } = props;
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            {cost?.occurence ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Occurence:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.occurrence} year(s)</Text>
                </View>
            ) : null}

            {cost?.initialOccurrence ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Initial Occurrence:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.initialOccurrence} year(s)</Text>
                </View>
            ) : null}

            {cost?.cost ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Cost:&nbsp;</Text>
                    <Text style={styles.value}> ${cost?.cost}</Text>
                </View>
            ) : null}

            <InitialCost cost={cost} />

            <CostSavings cost={cost} />

            <AnnualRateOfChange cost={cost} />

            {cost?.costPerUnit ? (
                <View style={styles.key}>
                    {cost?.costSavings ? (
                        <Text style={styles.text}>Cost Savings per Unit:&nbsp;</Text>
                    ) : (
                        <Text style={styles.text}>Cost per Unit:&nbsp;</Text>
                    )}
                    <Text style={styles.value}> {cost?.costPerUnit} </Text>
                </View>
            ) : null}

            <RateOfRecurrence cost={cost} />
            <Recurring cost={cost} />

            {cost?.recurring ? (
                <>
                    <View style={styles.key}>
                        <Text style={styles.text}>Rate of Recurrence:&nbsp;</Text>
                        <Text style={styles.value}> {cost?.recurring?.rateOfRecurrence} year(s)</Text>
                    </View>
                    <View style={styles.key}>
                        <Text style={styles.text}>Rate of Change of Value:&nbsp;</Text>
                        <InputTable
                            cost={cost}
                            header={"Value Rate of Change (%)"}
                            inputRows={cost?.recurring?.rateOfChangeValue}
                            year={year}
                        />
                    </View>
                </>
            ) : null}
        </View>
    );
};

export default ContractCostInput;
