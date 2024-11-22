import { Text, View } from "@react-pdf/renderer";
import { CostName, CostSavings, Description, UseIndex } from "./CostComponents";
import { styles } from "./pdfStyles";

const WaterCostInput = (props: { cost; year: number }) => {
    //TODO: specify type for cost
    const cost = props.cost;
    const year = props.year;
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />
            <CostSavings cost={cost} />

            {cost?.costSavings ? (
                <View style={styles.key}>
                    {cost?.costSavings ? (
                        <Text style={styles.text}>Usage Savings:&nbsp;</Text>
                    ) : (
                        <Text style={styles.text}>Usage:&nbsp;</Text>
                    )}
                </View>
            ) : null}

            {cost?.usage?.map((use) => {
                return (
                    <View style={styles.table}>
                        <Text style={styles.text}>{use?.season}</Text>
                        <Text style={styles.text}>
                            {use?.amount}
                            {cost?.unit}
                        </Text>
                        <Text style={styles.text}>
                            {use?.costPerUnit} $/{cost?.unit}
                        </Text>
                    </View>
                );
            })}

            {cost?.costSavings ? (
                <View style={styles.key}>
                    {cost?.costSavings ? (
                        <Text style={styles.text}>Disposal Savings:&nbsp;</Text>
                    ) : (
                        <Text style={styles.text}>Disaposal:&nbsp;</Text>
                    )}
                </View>
            ) : null}

            {cost?.disposal?.map((dis) => {
                return (
                    <View style={styles.table}>
                        <Text style={styles.text}>{dis?.season}</Text>
                        <Text style={styles.text}>
                            {dis?.amount} {cost?.unit}
                        </Text>
                        <Text style={styles.text}>
                            {dis?.costPerUnit}$/{cost?.unit}
                        </Text>
                    </View>
                );
            })}

            {cost?.escalation ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Escalation:&nbsp;</Text>
                    <Text style={styles.value}> {+cost?.escalation * 100}%</Text>
                </View>
            ) : null}

            <UseIndex cost={cost} year={year} />
        </View>
    );
};

export default WaterCostInput;
