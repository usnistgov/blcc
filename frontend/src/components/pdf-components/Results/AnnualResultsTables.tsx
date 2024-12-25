import { StyleSheet, Text, View } from "@react-pdf/renderer";
const border = "1px solid #000";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border
    },
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        textAlign: "center",
        borderBottom: border,
        borderRight: border,
        // borderLeft: border,
        marginTop: 0
    },
    value: {
        fontSize
    },
    alt: {
        fontSize: 10,
        // textAlign: "center",
        borderRight: border
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

export const NPVComparisonTable = (props: { headers: string[]; rows }) => {
    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value}>{header}</Text>
                ))}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={alt.key + "_lcc"}>
                    <Text style={styles.alt}>{alt.year}</Text>
                    <Text style={styles.alt}>${alt["0"]}</Text>
                    <Text style={styles.alt}>${alt["1"]}</Text>
                </View>
            ))}
        </View>
    );
};

export const NPVAltTable = (props: { rows }) => {
    const { rows } = props;
    console.log(rows);

    return (
        <View style={{ marginBottom: 10 }}>
            {/* results Table Header */}
            {npvAltTableHeaders.map((headers, index) => (
                <View key={`row_${index}`} style={styles.container}>
                    {headers.map((header) => (
                        <Text style={styles.value}>{header}</Text>
                    ))}
                </View>
            ))}

            {rows.map((altArray: npvAltTableType[], index: number) => (
                <View key={`row_${index}`} style={styles.row}>
                    {altArray.map((alt) => (
                        <View style={styles.row} key={alt.year + "_lcc"}>
                            <Text style={styles.alt}>{alt.year}</Text>
                            <Text style={styles.alt}>${alt.consumption}</Text>
                            <Text style={styles.alt}>${alt.recurring}</Text>
                            <Text style={styles.alt}>${alt.nonRecurring}</Text>
                            <Text style={styles.alt}>${alt.total}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};
