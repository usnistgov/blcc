import { Text, View } from "@react-pdf/renderer";
import { CostName, CostSavings, Description, RateOfRecurrence, Recurring, UseIndex } from "./CostComponents";
import InputTable from "./InputTable";
import { styles } from "./pdfStyles";

const OtherCostInput = (props: { cost; year: number }) => {
    //TODO: specify type for cost
    const { cost, year } = props;
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />
            {cost?.fuelType ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Fuel Type:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.fuelType}</Text>
                </View>
            ) : null}
            {cost?.tags ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Tags:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.tags}</Text>
                </View>
            ) : null}

            <CostSavings cost={cost} />
            {cost?.costOrBenefit ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Cost or Benefit:&nbsp;</Text>
                    <Text style={styles.value}>{cost?.costOrBenefit}</Text>
                </View>
            ) : null}
            {cost?.initialOccurrence ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Initial Occurrence:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.initialOccurrence}</Text>
                </View>
            ) : null}
            {cost?.valuePerUnit ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Value per Unit:&nbsp;</Text>
                    <Text style={styles.value}>
                        {cost?.valuePerUnit} per {cost?.unit}
                    </Text>
                </View>
            ) : null}
            {cost?.numberOfUnits ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Number Of Units:&nbsp;</Text>
                    <Text style={styles.value}>
                        {cost?.numberOfUnits} {cost?.unit}
                    </Text>
                </View>
            ) : null}
            {cost?.escalation ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Escalation:&nbsp;</Text>
                    {Array.isArray(cost?.escalation) ? (
                        <InputTable
                            cost={cost}
                            header={"Value Rate of Change %"}
                            inputRows={cost?.escalation}
                            year={year}
                        />
                    ) : (
                        <Text style={styles.value}> {cost.escalation}</Text>
                    )}
                </View>
            ) : null}
            {cost?.costAdjustment ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Cost Adjustment Factor:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.costAdjustment}</Text>
                </View>
            ) : null}
            {cost?.phaseIn ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Escalation:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.phaseIn}</Text>
                </View>
            ) : null}

            <Recurring cost={cost} />
            {cost?.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} />

                    <View style={styles.key}>
                        <Text style={styles.text}>Rate Of Change Value:&nbsp;</Text>
                        {Array.isArray(cost?.recurring?.rateOfChangeValue) ? (
                            <InputTable
                                cost={cost}
                                header={"Value Rate of Change %"}
                                inputRows={cost?.recurring?.rateOfChangeValue}
                                year={year}
                            />
                        ) : (
                            <Text style={styles.value}> {cost?.recurring?.rateOfChangeValue}</Text>
                        )}
                    </View>

                    <View style={styles.key}>
                        <Text style={styles.text}>Rate Of Change Units:&nbsp;</Text>
                        {Array.isArray(cost?.recurring?.rateOfChangeUnits) ? (
                            <InputTable
                                cost={cost}
                                header={"Unit Rate of Change %"}
                                inputRows={cost?.recurring?.rateOfChangeUnits}
                                year={year}
                            />
                        ) : (
                            <Text style={styles.value}> {cost?.recurring?.rateOfChangeUnits}</Text>
                        )}
                    </View>
                </>
            ) : null}
        </View>
    );
};

export default OtherCostInput;
