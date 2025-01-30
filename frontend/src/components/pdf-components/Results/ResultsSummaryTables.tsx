import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LccBaselineRow } from "components/allResultStreams";
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

type lccResults = {
    name: string;
    baseline: boolean;
    initialCost: number;
    lifeCycleCost: number;
    energy: number;
    ghgEmissions: number;
    scc: number;
    lccScc: number;
};

type lccBaseline = {
    name: string;
    baseline: boolean;
    sir: number;
    airr: number;
    spp: number;
    dpp: number;
    initialCost: number;
    deltaEnergy: number;
    deltaGhg: number;
    deltaScc: number;
    netSavings: number;
};

type npvSubCat = {
    category: string;
    subcategory: string;
} & {
    [key: string]: number;
};

export const LCCResultsTable = (props: { headers: string[]; rows: lccResults[] }) => {
    //TODO: specify type for cost

    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10, maxWidth: 800 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value} key={header + "_lcc"}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={alt.name + "_lcc"}>
                    <Text style={styles.alt}>{alt.name}</Text>
                    {/* change to base cost */}
                    <Text style={styles.alt}>${alt.initialCost || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.initialCost || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.lifeCycleCost || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.energy || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.ghgEmissions || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.scc || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.lccScc || "0.00"}</Text>
                </View>
            ))}
        </View>
    );
};

export const LCCBaselineTable = (props: { headers: string[]; rows: LccBaselineRow[] }) => {
    const { headers, rows } = props;
    return (
        <View style={{ marginBottom: 10 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => {
                    const width = ["SIRR", "AIRR", "SPP", "DPP"].includes(header) ? 75 : 114;
                    return (
                        <Text style={{ ...styles.value, width }} key={header + "_lccBaseline"}>
                            {header}
                        </Text>
                    );
                })}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={alt.name + "_lccBaseline"}>
                    <Text style={styles.alt}>{alt.name}</Text>
                    <Text style={styles.alt}>${alt.initialCost || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.initialCost || "0.00"}</Text>
                    <Text style={styles.smallCol}>${alt.sir || "0.00"}</Text>
                    <Text style={styles.smallCol}>${alt.airr || "0.00"}</Text>
                    <Text style={styles.smallCol}>${alt.spp || "0.00"}</Text>
                    <Text style={styles.smallCol}>${alt.dpp || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.deltaEnergy || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.deltaGhg || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.deltaScc || "0.00"}</Text>
                    <Text style={styles.alt}>${alt.netSavings || "0.00"}</Text>
                </View>
            ))}
        </View>
    );
};

export const NPVSubTable = (props: { headers: string[]; rows: npvSubCat[] }) => {
    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10, maxWidth: 500 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.header1} key={header + "_npvCosts"}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={alt.category + alt.subCategory + "_npvCosts"}>
                    <Text style={{ ...styles.cat, width: 125 }}>{alt.category}</Text>
                    <Text style={{ ...styles.col1, width: 125 }}>{alt.subcategory}</Text>
                    {Array.from({ length: headers.length - 2 }, (_, i) => (
                        <Text key={i} style={styles.alt}>
                            ${alt[`${i}`] || "0.00"}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
};

export const LCCResourceTable = (props: { headers: string[]; rows: npvSubCat[] }) => {
    const { headers, rows } = props;

    return (
        <View style={{ marginBottom: 10, maxWidth: 500 }}>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.header1} key={header + "_resource"}>
                        {header}
                    </Text>
                ))}
            </View>

            {rows.map((alt) => (
                <View style={styles.row} key={alt.category + alt.subCategory + "_resource"}>
                    <Text style={{ ...styles.cat, width: 125 }}>{alt.category}</Text>
                    <Text style={{ ...styles.col1, width: 125 }}>{alt.subcategory}</Text>
                    {Array.from({ length: headers.length - 2 }, (_, i) => (
                        <Text key={i} style={styles.alt}>
                            ${alt[`${i}`] || "0.00"}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
};
