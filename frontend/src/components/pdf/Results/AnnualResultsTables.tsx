import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { NpvCashflowComparisonSummary } from "blcc-format/ExportTypes";
import type { AnnualCostTypeNpvCashflowRow, NpvCashflowComparisonRow } from "util/ResultCalculations";
import { dollarFormatter } from "util/Util";
import { annualResultsStyles } from "../styles/annualResultsStyles";
import { styles } from "../styles/pdfStyles";

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
    summary: NpvCashflowComparisonSummary;
};

export function NPVComparisonTable({ headers, rows, summary }: NpvComparisonTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>NPV Cash Flow Comparison</Text>
            <View style={{ marginBottom: 10, maxWidth: 300 }}>
                {/* results Table Header */}
                <View style={annualResultsStyles.container}>
                    {headers.map((header) => (
                        <Text style={annualResultsStyles.value} key={`${header}_npvComparison`}>
                            {header}
                        </Text>
                    ))}
                </View>

                {rows?.map((alt: { year: number; [key: string]: number }, i) => (
                    <View style={annualResultsStyles.row} key={`${alt.key}_lcc_${i}`}>
                        <Text style={annualResultsStyles.alt}>{alt.year}</Text>
                        {Array.from({ length: headers.length - 1 }, (_, j) => (
                            <Text key={j} style={annualResultsStyles.alt}>
                                {dollarFormatter.format(alt[`${j}`])}
                            </Text>
                        ))}
                    </View>
                ))}
                <View style={annualResultsStyles.summaryRow} key={`${summary.key}_lcc_`}>
                    <Text style={annualResultsStyles.alt}>Total</Text>
                    {Array.from({ length: headers.length - 1 }, (_, j) => (
                        <Text key={j} style={annualResultsStyles.alt}>
                            {dollarFormatter.format(summary[`${j}`])}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
}

type NpvAltTableProps = {
    rows: AnnualCostTypeNpvCashflowRow[];
};

export function NPVAltTable({ rows }: NpvAltTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>NPV Cash Flow by Alternative</Text>
            <View style={{ marginBottom: 10 }}>
                {/* results Table Header */}
                {npvAltTableHeaders.map((headers, i) => (
                    <View key={`row_${i}`} style={annualResultsStyles.container}>
                        {headers.map((header, j) => (
                            <Text style={annualResultsStyles.value} key={`${header}_npvAlt_${j}`}>
                                {header}
                            </Text>
                        ))}
                    </View>
                ))}

                {rows.map((alt, index) => (
                    <View style={annualResultsStyles.row} key={`${alt.year}_row_${index}`}>
                        <Text style={annualResultsStyles.altSmallText}>{alt.year}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.consumption)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.demand)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.rebates)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.waterUse)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>
                            {dollarFormatter.format(alt.waterDisposal)}
                        </Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.investment)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.omr)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.replace)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>
                            {dollarFormatter.format(alt.residualValue)}
                        </Text>
                        <Text style={annualResultsStyles.altSmallText}>
                            {dollarFormatter.format(alt.implementation)}
                        </Text>
                        <Text style={annualResultsStyles.altSmallText}>
                            {dollarFormatter.format(alt.recurringContract)}
                        </Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.otherCosts)}</Text>
                        <Text style={annualResultsStyles.altSmallText}>{dollarFormatter.format(alt.total)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
