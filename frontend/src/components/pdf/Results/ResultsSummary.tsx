import { Text, View } from "@react-pdf/renderer";
import type { Summary } from "blcc-format/ExportTypes";
import { styles } from "components/pdf/styles/pdfStyles";
import { LCCBaselineTable, LCCResourceTable, LCCResultsTable, NPVSubTable } from "./ResultsSummaryTables";

const lifeCycleResultsColumns = [
    "Alternative",
    "Base Case",
    "Investment",
    "Life Cycle Cost",
    "Energy",
    "GHG Emissions (kg CO2e)",
];

const lifeCycleResultsBaseline = [
    "Alternative",
    "Base Case",
    "LCC",
    "Investment",
    "Net Savings",
    "SIR",
    "AIRR",
    "SPP",
    "DPP",
    "Change in Energy",
    "Change in GHG (kg CO2e)",
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
                <LCCResultsTable headers={lifeCycleResultsColumns} rows={summary.lccComparisonRows} />
                <LCCBaselineTable headers={lifeCycleResultsBaseline} rows={summary.lccBaseline} />
                <NPVSubTable headers={["Cost Type", "", ...altNames]} rows={summary.npvCosts} />
                <LCCResourceTable headers={["Resource Type", "", ...altNames]} rows={summary.lccResourceRows} />
            </View>
        </>
    );
}
