import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AnnualCostTypeNpvCashflowRow, NpvCashflowComparisonRow } from "util/ResultCalculations";
import { dollarFormatter } from "util/Util";
const border = "1px solid #000";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
        border,
        marginTop: 0,
    },
    value: {
        width: 100,
        fontSize,
        borderRight: "1px solid #fff",
    },
    alt: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 100,
    },
});

const npvAltTableHeaders = [
    ["", "Energy", "", "", "Water", "", "Capital", "", "", "", "Contract", "", "Other", ""],
    [
        "Year",
        "Consumption",
        "Demand",
        "Rebates",
        "Use",
        "Disposal",
        "Investment",
        "OMR",
        "Replace",
        "Residual Value",
        "Implementation",
        "Recurring",
        "Monetary",
        "Total",
    ],
];

type NpvComparisonTableProps = {
    headers: string[];
    rows: NpvCashflowComparisonRow[];
};

export function NPVComparisonTable({ headers, rows }: NpvComparisonTableProps) {
    return (
        <View style={{ marginBottom: 10, maxWidth: 300 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value} key={`${header}_npvComparison`}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows?.map((alt: { year: number; [key: string]: number }, i) => (
                <View style={styles.row} key={`${alt.key}_lcc_${i}`}>
                    <Text style={styles.alt}>{alt.year}</Text>
                    {Array.from({ length: headers.length - 1 }, (_, j) => (
                        <Text key={j} style={styles.alt}>
                            {dollarFormatter.format(alt[`${j}`])}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}

type NpvAltTableProps = {
    rows: AnnualCostTypeNpvCashflowRow[];
};

export function NPVAltTable({ rows }: NpvAltTableProps) {
    return (
        <View style={{ marginBottom: 10 }}>
            {/* results Table Header */}
            {npvAltTableHeaders.map((headers, i) => (
                <View key={`row_${i}`} style={styles.container}>
                    {headers.map((header, j) => (
                        <Text style={styles.value} key={`${header}_npvAlt_${j}`}>
                            {header}
                        </Text>
                    ))}
                </View>
            ))}

            {rows.map((alt, index) => (
                <View style={styles.row} key={`${alt.year}_row_${index}`}>
                    <Text style={styles.alt}>{alt.year}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.consumption)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.demand)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.rebates)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.waterUse)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.waterDisposal)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.omr)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.replace)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.residualValue)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.implementation)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.recurringContract)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.otherCosts)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.total)}</Text>
                </View>
            ))}
        </View>
    );
}
