import { Text, View } from "@react-pdf/renderer";
import type { Summary } from "blcc-format/ExportTypes";
import { styles } from "components/pdf/pdfStyles";
import { LCCBaselineTable, LCCResourceTable, LCCResultsTable, NPVSubTable } from "./ResultsSummaryTables";

const lifeCycleResultsColumns = [
    "Alternative",
    "Base Case",
    "Initial Cost",
    "Life Cycle Cost",
    "Energy",
    "GHG Emissions (kg co2)",
    "SCC",
    "LCC + SCC",
];

const lifeCycleResultsBaseline = [
    "Alternative",
    "Base Case",
    "Initial Cost",
    "SIRR",
    "AIRR",
    "SPP",
    "DPP",
    "Change in Energy",
    "Change in GHG (kg co2)",
    "Change in SCC",
    "Net Savings & SCC Reductions",
];

type ResultSummaryProps = {
    altNames: string[];
    summary: Summary;
};

export default function ResultsSummary({ altNames, summary }: ResultSummaryProps) {
    return (
        <>
            <View style={styles.section}>
                <hr style={styles.titleDivider} />
                <View style={styles.titleWrapper}>
                    <Text style={{ ...styles.title, marginBottom: 5 }}>Summary</Text>
                </View>
                <hr style={styles.titleDivider} />
            </View>
            <View>
                <Text style={styles.subHeading}>Life Cycle Results Comparison</Text>
                <LCCResultsTable headers={lifeCycleResultsColumns} rows={summary.lccComparisonRows} />
                <Text style={styles.subHeading}>Life Cycle Results Relative to Baseline Alternative</Text>
                <LCCBaselineTable headers={lifeCycleResultsBaseline} rows={summary.lccBaseline} />
                <Text style={styles.subHeading}>NPV Costs by Cost Subcategory</Text>
                <NPVSubTable headers={["Cost Type", "", ...altNames]} rows={summary.npvCosts} />
                <Text style={styles.subHeading}>Life Cycle Resource Consumption and Emissions Comparison</Text>
                <LCCResourceTable headers={["Resource Type", "", ...altNames]} rows={summary.lccResourceRows} />
            </View>
        </>
    );
}
