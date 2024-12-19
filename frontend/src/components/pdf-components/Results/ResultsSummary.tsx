import { Text, View } from "@react-pdf/renderer";

import { styles } from "../pdfStyles";

import ResultsTable from "./ResultsTable";

const lifeCycleResultsColumns = [
    "Alternative",
    "Base Case",
    "Initial Cost",
    "Life Cycle Cost",
    "Energy",
    "GHG Emissions (kg co2)",
    "SCC",
    "LCC + SCC"
];

const lifeCycleResultsBaseline = [
    "Alternative",
    "Base Case",
    "Initial Cost",
    "Life Cycle Cost",
    "SIRR",
    "AIRR",
    "SPP",
    "DPP",
    "Change in Energy",
    "Change in GHG (kg co2)",
    "Change in SCC",
    "Net Savings & SCC Reductions"
];

const ResultsSummary = (props: { altNames: string[]; summary }) => {
    const { altNames, summary } = props;
    console.log(summary);
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
                <ResultsTable headers={lifeCycleResultsColumns} />
                <ResultsTable headers={lifeCycleResultsBaseline} />
                <ResultsTable headers={["Cost Type", ...altNames]} />
                <ResultsTable headers={["Resource Type", ...altNames]} />
            </View>
        </>
    );
};

export default ResultsSummary;
