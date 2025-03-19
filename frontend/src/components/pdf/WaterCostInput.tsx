import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Project, WaterCost } from "blcc-format/Format";
import { CostName, CostSavings, Description, EscalationRates, UseIndex } from "./components/CostComponents";
import { blue, styles } from "./pdfStyles";
import { dollarFormatter } from "util/Util";

const border = "1px solid #000";
const fontSize = 10;

const localStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "white",
        textAlign: "center",
        backgroundColor: blue,
        border,
        width: "300px",
    },
    year: {
        width: "50px",
        borderRight: border,
        fontSize,
    },
    value: {
        width: "130px",
        fontSize,
    },
});

type WaterCostInputProps = {
    cost: WaterCost;
    year: number;
    project: Project;
};

export default function WaterCostInput({ cost, year, project }: WaterCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />
            <Description cost={cost} />
            <CostSavings cost={cost} />

            <View style={{ marginBottom: 8 }}>
                {cost?.costSavings ? (
                    <View style={styles.key}>
                        <Text style={styles.text}>Usage Savings:&nbsp;</Text>
                    </View>
                ) : (
                    <View style={styles.key}>
                        <Text style={styles.text}>Usage:&nbsp;</Text>
                    </View>
                )}

                <View style={localStyles.container}>
                    <Text style={styles.cell}>Season</Text>
                    <Text style={styles.cell}>Qty</Text>
                    <Text style={styles.cell}>Price/Unit</Text>
                </View>
                {cost?.usage?.map((use) => {
                    return (
                        <View key={use.season} style={styles.table}>
                            <Text style={styles.alt}>{use?.season}</Text>
                            <Text style={styles.alt}>
                                {use?.amount} {cost?.unit}
                            </Text>
                            <Text style={styles.alt}>
                                {dollarFormatter.format(use?.costPerUnit)}/{cost?.unit}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <View style={{ marginBottom: 8 }}>
                {cost?.costSavings ? (
                    <View style={styles.key}>
                        <Text style={styles.text}>Disposal Savings:&nbsp;</Text>
                    </View>
                ) : (
                    <View style={styles.key}>
                        <Text style={styles.text}>Disposal:&nbsp;</Text>
                    </View>
                )}

                <View style={localStyles.container}>
                    <Text style={styles.cell}>Season</Text>
                    <Text style={styles.cell}>Qty</Text>
                    <Text style={styles.cell}>Price/Unit</Text>
                </View>
                {cost?.disposal?.map((dis) => {
                    return (
                        <View key={dis.season} style={styles.table}>
                            <Text style={styles.alt}>{dis?.season}</Text>
                            <Text style={styles.alt}>
                                {dis?.amount} {cost?.unit}
                            </Text>
                            <Text style={styles.alt}>
                                {dollarFormatter.format(dis?.costPerUnit)}/{cost?.unit}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <EscalationRates cost={cost} year={year} project={project} />

            <UseIndex cost={cost} year={year} />
        </View>
    );
}
