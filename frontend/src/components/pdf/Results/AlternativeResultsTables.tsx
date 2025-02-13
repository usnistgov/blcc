import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AlternativeNpvCostTypeTotalRow, ResourceUsageRow } from "util/ResultCalculations";
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
        textWrap: "wrap",
    },
    row: {
        display: "flex",
        textWrap: "wrap",
        flexDirection: "row",
        textAlign: "center",
        borderBottom: border,
        borderRight: border,
        borderLeft: border,
        marginTop: 0,
    },
    value: {
        fontSize,
        width: 130,
        borderRight: "1px solid #fff",
    },
    alt: {
        width: 130,
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
    },
});

type NpvAltCashflowTableProps = {
    headers: string[];
    rows: AlternativeNpvCostTypeTotalRow[];
};

export function NpvAltCashflowTable({ headers, rows }: NpvAltCashflowTableProps) {
    return (
        <View style={{ marginBottom: 10, maxWidth: 390 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header, i) => (
                    <Text style={styles.value} key={`${header}_lcc_${i}`}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt, i) => (
                <View style={styles.row} key={`${alt.category}_lcc_${i}`}>
                    <Text style={styles.alt}>{alt.category}</Text>
                    <Text style={styles.alt}>{alt.subcategory}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.alternative)}</Text>
                </View>
            ))}
        </View>
    );
}

type NpvAltResourceTableProps = {
    headers: string[];
    rows: ResourceUsageRow[];
};

export function NpvAltResourceTable({ headers, rows }: NpvAltResourceTableProps) {
    return (
        <View style={{ marginBottom: 10, maxWidth: 520 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value} key={`${header}_altResource`}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt, index: number) => (
                <View key={`${alt.category}_altResource_row_${index}`} style={styles.row}>
                    <Text style={styles.alt}>{alt.category}</Text>
                    <Text style={{ ...styles.alt, width: 125 }}>{alt.subcategory}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.consumption)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.emissions)}</Text>
                </View>
            ))}
        </View>
    );
}
