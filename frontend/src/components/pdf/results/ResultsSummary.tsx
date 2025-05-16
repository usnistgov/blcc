import { View } from "@react-pdf/renderer";
import type { Summary } from "blcc-format/ExportTypes";
import { styles } from "components/pdf/pdfStyles";
import { Checkmark, SmallText, Title } from "../components/GeneralComponents";
import { LCCBaselineTable, LCCResourceTable, LCCResultsTable, NPVSubTable } from "./ResultsSummaryTables";
import { dollarFormatter, numberFormatter, percentFormatter, wholeNumberFormatter } from "util/Util";
import type { LccBaselineRow, LccComparisonRow, LCCResourceRow } from "util/ResultCalculations";
import type { Alternative } from "blcc-format/Format";

const lifeCycleComparisonColumns = [
    { name: "Alternative", key: "name" },
    {
        name: "Base Case",
        key: "baseline",
        renderCell: (row: LccBaselineRow) => (row.baseline ? <Checkmark /> : <></>),
    },
    { name: "Investment", key: "investment", formatter: dollarFormatter },
    { name: "Life Cycle Cost", key: "lifeCycleCost", formatter: dollarFormatter },
    {
        name: "Energy",
        key: "energy",
        renderCell: (row: LccComparisonRow) => <SmallText text={`${wholeNumberFormatter.format(row.energy)} gJ`} />,
    },
    { name: "GHG Emissions (kg CO2e)", key: "ghgEmissions", formatter: wholeNumberFormatter },
];

const lifeCycleBaselineColumns = [
    { name: "Alternative", key: "name", headerStyles: { fontSize: 9 } },
    {
        name: "Base Case",
        key: "baseline",
        renderCell: (row: LccBaselineRow) => (row.baseline ? <Checkmark /> : <></>),
    },
    { name: "LCC", key: "lcc", formatter: dollarFormatter },
    { name: "Investment", key: "investment", formatter: dollarFormatter, headerStyles: { fontSize: 9 } },
    { name: "Net Savings", key: "netSavings", formatter: dollarFormatter },
    { name: "SIR", key: "sir", formatter: numberFormatter },
    { name: "AIRR", key: "airr", formatter: percentFormatter },
    { name: "SPP", key: "spp", formatter: numberFormatter },
    { name: "DPP", key: "dpp", formatter: numberFormatter },
    {
        name: "Change in Energy",
        key: "deltaEnergy",
        renderCell: (row: LccBaselineRow) => <SmallText text={`${wholeNumberFormatter.format(row.deltaEnergy)} gJ`} />,
    },
    { name: "Change in GHG (kg CO2e)", key: "deltaGhg", formatter: wholeNumberFormatter },
];

type ResultSummaryProps = {
    alternatives: Alternative[];
    summary: Summary;
};

export default function ResultsSummary({ alternatives, summary }: ResultSummaryProps) {
    return (
        <>
            <View style={styles.section}>
                <Title title="Summary" />
            </View>
            <View>
                <LCCResultsTable columns={lifeCycleComparisonColumns} rows={summary.lccComparisonRows} />
                <LCCBaselineTable columns={lifeCycleBaselineColumns} rows={summary.lccBaseline} />
                <NPVSubTable
                    columns={[
                        { key: "category", name: "Cost Type" },
                        { key: "subcategory", name: "" },
                        ...alternatives.map((alt, i) => {
                            return {
                                key: `${alt.id}`,
                                name: [alt.name],
                                formatter: dollarFormatter,
                            };
                        }),
                    ]}
                    rows={summary.npvCosts}
                />
                <LCCResourceTable
                    columns={[
                        { key: "category", name: "Resource Type" },
                        { key: "subcategory", name: "" },
                        ...alternatives.map((alt, i) => {
                            return {
                                key: `${i}`,
                                name: [alt.name],
                                renderCell: (row: LCCResourceRow, col: { key: string; name: string }) => (
                                    <SmallText
                                        text={`${wholeNumberFormatter.format(row[col.key] ?? 0)} ${row.units}`}
                                    />
                                ),
                            };
                        }),
                    ]}
                    rows={summary.lccResourceRows}
                />
            </View>
        </>
    );
}
