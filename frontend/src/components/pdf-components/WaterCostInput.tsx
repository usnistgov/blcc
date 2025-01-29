import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { WaterCost } from "blcc-format/Format";
import { CostName, CostSavings, Description, EscalationRates, UseIndex } from "./CostComponents";
import { styles } from "./pdfStyles";

const border = "1px solid #000";
const fontSize = 10;

const localStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border,
        width: "300px"
    },
    year: {
        width: "50px",
        borderRight: border,
        fontSize
    },
    value: {
        width: "130px",
        fontSize
    }
});

const WaterCostInput = (props: { cost: WaterCost; year: number }) => {
    //TODO: specify type for cost
    const cost = props.cost;
    const year = props.year;
    return (
        <View key={cost.id}>
            <CostName cost={cost} />
            <Description cost={cost} />
            <CostSavings cost={cost} />

            <View style={{ marginBottom: 8 }}>
                {cost?.costSavings ? (
                    <View style={styles.key}>
                        {cost?.costSavings ? (
                            <Text style={styles.text}>Usage Savings:&nbsp;</Text>
                        ) : (
                            <Text style={styles.text}>Usage:&nbsp;</Text>
                        )}
                    </View>
                ) : null}

                <View style={localStyles.container}>
                    <Text style={styles.cell}>Season</Text>
                    <Text style={styles.cell}>Qty/Unit</Text>
                    <Text style={styles.cell}>Price/Unit</Text>
                </View>
                {cost?.usage?.map((use) => {
                    return (
                        <View style={styles.table}>
                            <Text style={styles.alt}>{use?.season}</Text>
                            <Text style={styles.alt}>
                                {use?.amount}/{cost?.unit}
                            </Text>
                            <Text style={styles.alt}>
                                {use?.costPerUnit} $/{cost?.unit}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <View style={{ marginBottom: 8 }}>
                {cost?.costSavings ? (
                    <View style={styles.key}>
                        {cost?.costSavings ? (
                            <Text style={styles.text}>Disposal Savings:&nbsp;</Text>
                        ) : (
                            <Text style={styles.text}>Disaposal:&nbsp;</Text>
                        )}
                    </View>
                ) : null}

                <View style={localStyles.container}>
                    <Text style={styles.cell}>Season</Text>
                    <Text style={styles.cell}>Qty/Unit</Text>
                    <Text style={styles.cell}>Price/Unit</Text>
                </View>
                {cost?.disposal?.map((dis) => {
                    return (
                        <View style={styles.table}>
                            <Text style={styles.alt}>{dis?.season}</Text>
                            <Text style={styles.alt}>
                                {dis?.amount}/{cost?.unit}
                            </Text>
                            <Text style={styles.alt}>
                                {dis?.costPerUnit}$/{cost?.unit}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <EscalationRates cost={cost} year={year} />

            <UseIndex cost={cost} year={year} />
        </View>
    );
};

export default WaterCostInput;
