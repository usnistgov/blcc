import { Text, View } from "@react-pdf/renderer";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    InitialOccurence,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring
} from "./CostComponents";
import { styles } from "./pdfStyles";

const ContractCostInput = (props: { cost; year: number }) => {
    //TODO: specify type for cost
    const { cost, year } = props;
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            {cost?.occurrence ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Occurrence:&nbsp;</Text>
                    <Text style={styles.value}> Year - {cost?.occurrence}</Text>
                </View>
            ) : null}

            <InitialOccurence cost={cost} />

            <CostSavings cost={cost} />

            {cost?.cost ? (
                <View style={styles.key}>
                    {cost?.costSavings ? (
                        <Text style={styles.text}>Savings:&nbsp;</Text>
                    ) : (
                        <Text style={styles.text}>Cost:&nbsp;</Text>
                    )}
                    <Text style={styles.value}> ${cost?.cost}</Text>
                </View>
            ) : null}

            <InitialCost cost={cost} />

            <AnnualRateOfChange cost={cost} />

            <Recurring cost={cost} />
            {cost?.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} year={year} />
                    <RateOfChangeValue cost={cost} year={year} />
                </>
            ) : null}
        </View>
    );
};

export default ContractCostInput;
