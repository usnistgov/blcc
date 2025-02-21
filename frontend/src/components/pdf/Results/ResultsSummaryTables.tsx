import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CategorySubcategoryRow, LccBaselineRow, LccComparisonRow } from "util/ResultCalculations";
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
        borderBottom: border,
        borderRight: border,
        borderLeft: border,
        marginTop: 0,
        textWrap: "wrap",
    },
    value: {
        fontSize,
        textWrap: "wrap",
        borderRight: "1px solid #fff",
        width: 114,
    },
    alt: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 114,
    },
    cat: {
        width: 100,
        fontSize: 10,
        borderRight: border,
    },
    subCat: {
        width: 100,
        fontSize: 10,
        borderRight: border,
    },
    smallCol: {
        width: 75,
        fontSize: 10,
        borderRight: border,
    },
    col1: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 125,
    },
    header1: {
        fontSize,
        textWrap: "wrap",
        width: 125,
        borderRight: "1px solid #fff",
    },
});

type LccResultsTableProps = {
    headers: string[];
    rows: LccComparisonRow[];
};

export function LCCResultsTable({ headers, rows }: LccResultsTableProps) {
    return (
        <View style={{ marginBottom: 10, maxWidth: 800 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header, i) => (
                    <Text style={styles.value} key={`${header}_lcc_${i}`}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt, i) => (
                <View style={styles.row} key={`${alt.name}_lcc_${i}`}>
                    <Text style={styles.alt}>{alt.name}</Text>
                    {/* change to base cost */}
                    <Text style={styles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.lifeCycleCost)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.energy)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.ghgEmissions)}</Text>
                </View>
            ))}
        </View>
    );
}

type LccBaselineTableProps = {
    headers: string[];
    rows: LccBaselineRow[];
};

export function LCCBaselineTable({ headers, rows }: LccBaselineTableProps) {
    return (
        <View style={{ marginBottom: 10 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => {
                    const width = ["SIRR", "AIRR", "SPP", "DPP"].includes(header) ? 75 : 114;
                    return (
                        <Text style={{ ...styles.value, width }} key={`${header}_lccBaseline`}>
                            {header}
                        </Text>
                    );
                })}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={`${alt.name}_lccBaseline`}>
                    <Text style={styles.alt}>{alt.name}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                    <Text style={styles.smallCol}>{dollarFormatter.format(alt.sir)}</Text>
                    <Text style={styles.smallCol}>{dollarFormatter.format(alt.airr)}</Text>
                    <Text style={styles.smallCol}>{dollarFormatter.format(alt.spp)}</Text>
                    <Text style={styles.smallCol}>{dollarFormatter.format(alt.dpp)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.deltaEnergy)}</Text>
                    <Text style={styles.alt}>{dollarFormatter.format(alt.deltaGhg)}</Text>
                </View>
            ))}
        </View>
    );
}

type NpvSubCatProps = {
    headers: string[];
    rows: CategorySubcategoryRow[];
};

export function NPVSubTable({ headers, rows }: NpvSubCatProps) {
    return (
        <View style={{ marginBottom: 10, maxWidth: 500 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.header1} key={`${header}_npvCosts`}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt, i) => (
                <View style={styles.row} key={`${alt.category}_${alt.subCategory}_npvCosts_${i}`}>
                    <Text style={{ ...styles.cat, width: 125 }}>{alt.category}</Text>
                    <Text style={{ ...styles.col1, width: 125 }}>{alt.subcategory}</Text>
                    {Array.from({ length: headers.length - 2 }, (_, i) => (
                        <Text key={`${alt.category}_${alt.subCategory}_npvCosts_${i}`} style={styles.alt}>
                            {dollarFormatter.format(alt[`${i}`])}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}

export function LCCResourceTable({ headers, rows }: NpvSubCatProps) {
    return (
        <View style={{ marginBottom: 10, maxWidth: 500 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.header1} key={`${header}_resource`}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt, i) => (
                <View style={styles.row} key={`${alt.category}_${alt.subCategory}_resource_${i}`}>
                    <Text style={{ ...styles.cat, width: 125 }}>{alt.category}</Text>
                    <Text style={{ ...styles.col1, width: 125 }}>{alt.subcategory}</Text>
                    {Array.from({ length: headers.length - 2 }, (_, i) => (
                        <Text key={`${alt.category}_${alt.subcategory}_resource_${i}`} style={styles.alt}>
                            {dollarFormatter.format(alt[`${i}`])}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}
