import { Image, Text, View } from "@react-pdf/renderer";
import type { Annual } from "blcc-format/ExportTypes";
import { styles } from "../pdfStyles";
import { type GridCol, Title } from "../components/GeneralComponents";
import { CashFlowCostType, NPVComparisonTable } from "./AnnualResultsTables";
import { dollarFormatter } from "util/Util";
import type { Alternative } from "blcc-format/Format";

const costTypeColumns = [
    { name: ["", "Year"], key: "year" },
    {
        name: ["Energy", "Consumption"],
        key: "consumption",
        formatter: dollarFormatter,
    },
    { name: ["", "Demand"], key: "demand", formatter: dollarFormatter },
    { name: ["", "Rebates"], key: "rebates", formatter: dollarFormatter },
    { name: ["Water", "Use"], key: "waterUse", formatter: dollarFormatter },
    { name: ["", "Disposal"], key: "waterDisposal", formatter: dollarFormatter },
    {
        name: ["Capital", "Investment"],
        key: "investment",
        formatter: dollarFormatter,
    },
    { name: ["", "OMR"], key: "omr", formatter: dollarFormatter },
    { name: ["", "Replace"], key: "replace", formatter: dollarFormatter },
    {
        name: ["", "Residual Value"],
        key: "residualValue",
        formatter: dollarFormatter,
    },
    {
        name: ["Contract", "Non-Recurring"],
        key: "implementation",
        formatter: dollarFormatter,
    },
    {
        name: ["", "Recurring"],
        key: "recurringContract",
        formatter: dollarFormatter,
    },
    {
        name: ["Other", "Monetary"],
        key: "otherCosts",
        formatter: dollarFormatter,
    },
    { name: ["", "Total"], key: "total", formatter: dollarFormatter },
];

type AnnualResultsPdfProps = {
    alternatives: Alternative[];
    annual: Annual;
    annualCashFlows: string;
    cashFlowBySubtype: string[];
};

export default function AnnualResultsPdf({
    alternatives,
    annual,
    annualCashFlows,
    cashFlowBySubtype,
}: AnnualResultsPdfProps) {
    const npvComparisonColumns: GridCol[] = [
        { name: "Year", key: "year" },
        ...alternatives.map((alt, i) => {
            return { name: alt.name, key: `${alt.id}`, formatter: dollarFormatter };
        }),
    ];
    annual.npvCashflowComparisonSummary.year = "Total";

    return (
        <View style={styles.section} break>
            <Title title="Annual Results" />
            <View>
                <NPVComparisonTable
                    columns={npvComparisonColumns}
                    rows={annual.npvCashflowComparison}
                    summary={annual.npvCashflowComparisonSummary}
                />
                <View wrap={false}>
                    <Text style={styles.heading}>NPV Cash Flows</Text>
                    <Image key={annualCashFlows} src={annualCashFlows} />
                </View>
                {alternatives
                    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
                    ?.map((alt, index) => (
                        <View key={alt.name}>
                            <Text style={styles.heading}>Annual Results for Alternative: {alt.name}</Text>
                            <CashFlowCostType columns={costTypeColumns} rows={annual.alternativeNpvCashflows[index]} />
                            <View wrap={false}>
                                <Text style={styles.subHeading}>Cash Flows by Subtype</Text>
                                <Image key={cashFlowBySubtype[index]} src={cashFlowBySubtype[index]} />
                            </View>
                        </View>
                    ))}
            </View>
        </View>
    );
}
