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
        border,
        textWrap: "wrap"
    },
    row: {
        display: "flex",
        textWrap: "wrap",
        flexDirection: "row",
        textAlign: "center",
        borderBottom: border,
        borderRight: border,
        borderLeft: border,
        marginTop: 0
    },
    value: {
        fontSize,
        width: 130,
        borderRight: "1px solid #fff"
    },
    alt: {
        width: 130,
        fontSize: 10,
        textAlign: "center",
        borderRight: border
    }
});

type npvAltCashFlowTableType = {
    category: String;
    subcategory: String;
    alternative: number[];
};

// ask Luke about this
type npvAltResourceTableType = {
    category: String;
    subcategory: String;
    consumption?: number[];
    emissions?: number[];
    alternative?: number[];
};

export const NpvAltCashflowTable = (props: { headers: string[]; rows: npvAltCashFlowTableType[] }) => {
    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10, maxWidth: 390 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value} key={header + "_lcc"}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={alt.category + "_lcc"}>
                    <Text style={styles.alt}>{alt.category}</Text>
                    <Text style={styles.alt}>{alt.subcategory}</Text>
                    <Text style={styles.alt}>${alt.alternative || "0.00"} </Text>
                </View>
            ))}
        </View>
    );
};

export const NpvAltResourceTable = (props: { headers: string[]; rows: npvAltResourceTableType[] }) => {
    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10, maxWidth: 520 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value} key={header + "_altResource"}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt, index: number) => (
                <View key={alt.category + "altResource" + `row_${index}`} style={styles.row}>
                    <Text style={styles.alt}>{alt.category}</Text>
                    <Text style={{ ...styles.alt, width: 125 }}>{alt.subcategory}</Text>
                    <Text style={styles.alt}>${alt.consumption || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.emissions || "0.00"}</Text>
                </View>
            ))}
        </View>
    );
};
