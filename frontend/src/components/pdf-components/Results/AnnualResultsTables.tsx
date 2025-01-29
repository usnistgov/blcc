import { StyleSheet, Text, View } from "@react-pdf/renderer";
const border = "1px solid #000";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border
    },
    row: {
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
        border,
        marginTop: 0
    },
    value: {
        width: 100,
        fontSize,
        borderRight: "1px solid #fff"
    },
    alt: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 100
    }
});

type npvAltTableType = {
    year: number;
    investment: number[];
    consumption: number[];
    recurring: number[];
    nonRecurring: number[];
    total: number[];
};

const npvAltTableHeaders = [
    ["", "", "Energy", "", "", "Water", "", "OMR", "", "", "", ""],
    [
        "Year",
        "Investment",
        "Consumption",
        "Demand",
        "Rebates",
        "Use",
        "Disposal",
        "Recurring",
        "Non-Recurring",
        "Replace",
        "Residual Value",
        "Total"
    ]
];

export const NPVComparisonTable = (props: { headers: string[]; rows: { year: number; [key: string]: number }[] }) => {
    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10, maxWidth: 300 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value} key={header + "_npvComparison"}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows?.map((alt: { year: number; [key: string]: number }) => (
                <View style={styles.row} key={alt.key + "_lcc"}>
                    <Text style={styles.alt}>{alt.year}</Text>
                    {Array.from({ length: headers.length - 1 }, (_, i) => (
                        <Text key={i} style={styles.alt}>
                            ${alt[`${i}`] || "0.00"}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
};

export const NPVAltTable = (props: { rows: npvAltTableType[] }) => {
    const { rows } = props;

    return (
        <View style={{ marginBottom: 10 }}>
            {/* results Table Header */}
            {npvAltTableHeaders.map((headers, index) => (
                <View key={`row_${index}`} style={styles.container}>
                    {headers.map((header) => (
                        <Text style={styles.value} key={header + "_npvAlt"}>
                            {header}
                        </Text>
                    ))}
                </View>
            ))}

            {/* ask luke about this */}
            {rows.map((alt: npvAltTableType, index: number) => (
                <View style={styles.row} key={alt.year + `row_${index}`}>
                    <Text style={styles.alt}>{alt.year}</Text>
                    <Text style={styles.alt}>${alt.consumption || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.recurring || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.nonRecurring || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.consumption || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.recurring || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.nonRecurring || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.total || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.consumption || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.recurring || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.nonRecurring || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.total || "0.00"}</Text>
                </View>
            ))}
        </View>
    );
};
