import { Image, Text, View } from "@react-pdf/renderer";
import type { Annual } from "blcc-format/ExportTypes";
import { styles } from "../pdfStyles";
import { type GridCol, Title } from "../components/GeneralComponents";
import { CashFlowCostType, NPVComparisonTable } from "./AnnualResultsTables";
import { dollarFormatter } from "util/Util";

const costTypeColumns = [
    { name: ["", "Year"], key: "year" },
    { name: ["Energy", "Consumption"], key: "consumption", formatter: dollarFormatter },
    { name: ["", "Demand"], key: "demand", formatter: dollarFormatter },
    { name: ["", "Rebates"], key: "rebates", formatter: dollarFormatter },
    { name: ["Water", "Use"], key: "waterUse", formatter: dollarFormatter },
    { name: ["", "Disposal"], key: "waterDisposal", formatter: dollarFormatter },
    { name: ["Capital", "Investment"], key: "investment", formatter: dollarFormatter },
    { name: ["", "OMR"], key: "omr", formatter: dollarFormatter },
    { name: ["", "Replace"], key: "replace", formatter: dollarFormatter },
    { name: ["", "Residual Value"], key: "residualValue", formatter: dollarFormatter },
    { name: ["Contract", "Non-Recurring"], key: "implementation", formatter: dollarFormatter },
    { name: ["", "Recurring"], key: "recurringContract", formatter: dollarFormatter },
    { name: ["Other", "Monetary"], key: "otherCosts", formatter: dollarFormatter },
    { name: ["", "Total"], key: "total", formatter: dollarFormatter },
];

type AnnualResultsPdfProps = {
    altNames: string[];
    annual: Annual;
    graphs: string[];
};

export default function AnnualResultsPdf({ altNames, annual, graphs }: AnnualResultsPdfProps) {
    const npvComparisonColumns: GridCol[] = [
        { name: "Year", key: "year" },
        ...altNames.map((altName, i) => {
            return { name: altName, key: `${i}`, formatter: dollarFormatter };
        }),
    ];
    annual.npvCashflowComparisonSummary.year = "Total";

    return (
        <View style={styles.section}>
            <Title title="Annual Results" />
            <View>
                <NPVComparisonTable
                    columns={npvComparisonColumns}
                    rows={annual.npvCashflowComparison}
                    summary={annual.npvCashflowComparisonSummary}
                />
                {altNames?.map((name, index) => (
                    <View key={name} wrap={false}>
                        <Text style={styles.heading}>Annual Results for Alternative: {name}</Text>
                        <CashFlowCostType columns={costTypeColumns} rows={annual.alternativeNpvCashflows[index]} />
                        <Text style={styles.subHeading}>NPV Cash Flows</Text>
                        <Text style={styles.subHeading}>Tag/Object by Year</Text>
                    </View>
                ))}
            </View>
            <View>
                {graphs.map((src: string) => (
                    <Image key={src} src={src} />
                ))}
            </View>
        </View>
    );
}
