import { G, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { CategorySubcategoryRow, LccBaselineRow, LccComparisonRow, LCCResourceRow } from "util/ResultCalculations";
import { dollarFormatter, numberFormatter, percentFormatter } from "util/Util";
import { resultsSummaryStyles } from "../styles/resultsSummaryStyles";
import { styles } from "../styles/pdfStyles";

type LccResultsTableProps = {
    headers: string[];
    rows: LccComparisonRow[];
};

export function LCCResultsTable({ headers, rows }: LccResultsTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Life Cycle Results Comparison</Text>
            <View style={{ marginBottom: 10, maxWidth: 800 }}>
                {/* results Table Header */}
                <View style={resultsSummaryStyles.container}>
                    {headers.map((header, i) => (
                        <Text style={resultsSummaryStyles.value} key={`${header}_lcc_${i}`}>
                            {header}
                        </Text>
                    ))}
                </View>

                {rows.map((alt, i) => (
                    <View style={resultsSummaryStyles.row} key={`${alt.name}_lcc_${i}`}>
                        <Text style={resultsSummaryStyles.alt}>{alt.name}</Text>(
                        {alt.baseline ? (
                            <Svg viewBox="0 0 100 100" width={12} height={12} style={resultsSummaryStyles.alt}>
                                <Path
                                    d="M78.049,19.015L29.458,67.606c-0.428,0.428-1.121,0.428-1.548,0L0.32,40.015c-0.427-0.426-0.427-1.119,0-1.547l6.704-6.704
		c0.428-0.427,1.121-0.427,1.548,0l20.113,20.112l41.113-41.113c0.429-0.427,1.12-0.427,1.548,0l6.703,6.704
		C78.477,17.894,78.477,18.586,78.049,19.015z"
                                    stroke="#000000"
                                    fill="#000000"
                                />
                            </Svg>
                        ) : (
                            <Text style={resultsSummaryStyles.alt} />
                        )}
                        )<Text style={resultsSummaryStyles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                        <Text style={resultsSummaryStyles.alt}>{dollarFormatter.format(alt.lifeCycleCost)}</Text>
                        <Text style={resultsSummaryStyles.alt}>{numberFormatter.format(alt.energy)} gJ</Text>
                        <Text style={resultsSummaryStyles.alt}>{numberFormatter.format(alt.ghgEmissions)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

type LccBaselineTableProps = {
    headers: string[];
    rows: LccBaselineRow[];
};

export function LCCBaselineTable({ headers, rows }: LccBaselineTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Life Cycle Results Relative to Baseline Alternative</Text>
            <View style={{ marginBottom: 10 }}>
                {/* results Table Header */}
                <View style={resultsSummaryStyles.container}>
                    {headers.map((header) => {
                        const width = ["SIRR", "AIRR", "SPP", "DPP"].includes(header) ? 75 : 114;
                        return (
                            <Text style={{ ...resultsSummaryStyles.value, width }} key={`${header}_lccBaseline`}>
                                {header}
                            </Text>
                        );
                    })}
                </View>

                {rows.map((alt) => (
                    <View style={resultsSummaryStyles.row} key={`${alt.name}_lccBaseline`}>
                        <Text style={resultsSummaryStyles.alt}>{alt.name}</Text>
                        {alt.baseline ? (
                            <Svg viewBox="0 0 100 100" width={12} height={12} style={resultsSummaryStyles.alt}>
                                <Path
                                    d="M78.049,19.015L29.458,67.606c-0.428,0.428-1.121,0.428-1.548,0L0.32,40.015c-0.427-0.426-0.427-1.119,0-1.547l6.704-6.704
		c0.428-0.427,1.121-0.427,1.548,0l20.113,20.112l41.113-41.113c0.429-0.427,1.12-0.427,1.548,0l6.703,6.704
		C78.477,17.894,78.477,18.586,78.049,19.015z"
                                    stroke="#000000"
                                    fill="#000000"
                                />
                            </Svg>
                        ) : (
                            <Text style={resultsSummaryStyles.alt} />
                        )}
                        <Text style={resultsSummaryStyles.alt}>{dollarFormatter.format(alt.lcc)}</Text>
                        <Text style={resultsSummaryStyles.alt}>{dollarFormatter.format(alt.investment)}</Text>
                        <Text style={resultsSummaryStyles.alt}>{dollarFormatter.format(alt.netSavings)}</Text>
                        <Text style={resultsSummaryStyles.smallCol}>{numberFormatter.format(alt.sir)}</Text>
                        <Text style={resultsSummaryStyles.smallCol}>{percentFormatter.format(alt.airr)}</Text>
                        <Text style={resultsSummaryStyles.smallCol}>{numberFormatter.format(alt.spp)}</Text>
                        <Text style={resultsSummaryStyles.smallCol}>{numberFormatter.format(alt.dpp)}</Text>
                        <Text style={resultsSummaryStyles.alt}>{numberFormatter.format(alt.deltaEnergy)} gJ</Text>
                        <Text style={resultsSummaryStyles.alt}>{numberFormatter.format(alt.deltaGhg)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

type NpvSubCatProps = {
    headers: string[];
    rows: CategorySubcategoryRow[];
};

export function NPVSubTable({ headers, rows }: NpvSubCatProps) {
    console.log(rows);
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>NPV Costs by Cost Subcategory</Text>
            <View style={{ marginBottom: 10, maxWidth: 500 }}>
                {/* results Table Header */}
                <View style={resultsSummaryStyles.container}>
                    {headers.map((header) => (
                        <Text style={resultsSummaryStyles.header1} key={`${header}_npvCosts`}>
                            {header}
                        </Text>
                    ))}
                </View>

                {rows.map((alt, i) => (
                    <View style={resultsSummaryStyles.row} key={`${alt.category}_${alt.subCategory}_npvCosts_${i}`}>
                        <Text style={{ ...resultsSummaryStyles.cat, width: 125 }}>{alt.category}</Text>
                        <Text style={{ ...resultsSummaryStyles.col1, width: 125 }}>{alt.subcategory}</Text>
                        {Array.from({ length: headers.length - 2 }, (_, i) => (
                            <Text
                                key={`${alt.category}_${alt.subCategory}_npvCosts_${i}`}
                                style={resultsSummaryStyles.alt}
                            >
                                {dollarFormatter.format(alt[`${i}`] ?? 0)}
                            </Text>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

type LCCResourceProps = {
    headers: string[];
    rows: LCCResourceRow[];
};

export function LCCResourceTable({ headers, rows }: LCCResourceProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Life Cycle Resource Consumption and Emissions Comparison</Text>
            <View style={{ marginBottom: 10, maxWidth: 500 }} wrap={false}>
                {/* results Table Header */}
                <View style={resultsSummaryStyles.container}>
                    {headers.map((header) => (
                        <Text style={resultsSummaryStyles.header1} key={`${header}_resource`}>
                            {header}
                        </Text>
                    ))}
                </View>

                {rows.map((alt, i) => (
                    <View style={resultsSummaryStyles.row} key={`${alt.category}_${alt.subCategory}_resource_${i}`}>
                        <Text style={{ ...resultsSummaryStyles.cat, width: 125 }}>{alt.category}</Text>
                        <Text style={{ ...resultsSummaryStyles.col1, width: 125 }}>{alt.subcategory}</Text>
                        {Array.from({ length: headers.length - 2 }, (_, i) => (
                            <Text
                                key={`${alt.category}_${alt.subcategory}_resource_${i}`}
                                style={resultsSummaryStyles.alt}
                            >
                                {numberFormatter.format(alt[`${i}`] ?? 0)} {alt.units}
                            </Text>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}
