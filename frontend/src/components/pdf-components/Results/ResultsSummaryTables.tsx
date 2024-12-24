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
        borderLeft: border,
        marginTop: 0
    },
    value: {
        fontSize
    },
    alt: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border
    },
    cat: {
        width: "100px",
        fontSize: 10,
        borderRight: border
        // textAlign: "center"
    },
    subCat: {
        width: "100px",
        fontSize: 10,
        borderRight: border
        // textAlign: "center"
    }
});

export const LCCResultsTable = (props: { headers: string[]; rows }) => {
    //TODO: specify type for cost

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
                <View style={styles.row} key={alt.name + "_lcc"}>
                    <Text style={styles.alt}>{alt.name}</Text>
                    <Text style={styles.alt}>${alt.initialCost}</Text>
                    <Text style={styles.alt}>${alt.initialCost}</Text>
                    <Text style={styles.alt}>${alt.lifeCycleCost}</Text>
                    <Text style={styles.alt}>${alt.energy}</Text>
                    <Text style={styles.alt}>${alt.ghgEmissions}</Text>
                    <Text style={styles.alt}>${alt.scc}</Text>
                    <Text style={styles.alt}>${alt.lccScc}</Text>
                </View>
            ))}
        </View>
    );
};

export const LCCBaselineTable = (props: { headers: string[]; rows }) => {
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
                <View style={styles.row} key={alt.name + "_lccBaseline"}>
                    <Text style={styles.alt}>{alt.name}</Text>
                    <Text style={styles.alt}>${alt.initialCost}</Text>
                    <Text style={styles.alt}>${alt.initialCost}</Text>
                    <Text style={styles.alt}>${alt.sir}</Text>
                    <Text style={styles.alt}>${alt.airr}</Text>
                    <Text style={styles.alt}>${alt.deltaEnergy}</Text>
                    <Text style={styles.alt}>${alt.deltaGhg}</Text>
                    <Text style={styles.alt}>${alt.deltaScc}</Text>
                    <Text style={styles.alt}>${alt.netSavings}</Text>
                </View>
            ))}
        </View>
    );
};

export const NPVSubTable = (props: { headers: string[]; rows }) => {
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
                <View style={styles.row} key={alt.category + alt.subCategory}>
                    <Text style={styles.cat}>{alt.category}</Text>
                    <Text style={styles.subCat}>{alt.subcategory}</Text>
                    <Text style={styles.alt}>${alt["0"] || "0.00"}</Text>
                    <Text style={styles.alt}>${alt["1"] || "0.00"}</Text>
                </View>
            ))}
        </View>
    );
};

export const LCCResourceTable = (props: { headers: string[]; rows }) => {
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
                <View style={styles.row} key={alt.category + alt.subCategory}>
                    <Text style={styles.cat}>{alt.category}</Text>
                    <Text style={styles.subCat}>{alt.subcategory}</Text>
                    <Text style={styles.alt}>${alt["0"] || "0.00"}</Text>
                    <Text style={styles.alt}>${alt["1"] || "0.00"}</Text>
                </View>
            ))}
        </View>
    );
};
