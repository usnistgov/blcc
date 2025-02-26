import { Text, View } from "@react-pdf/renderer";
import type { AlternativeNpvCostTypeTotalRow, ResourceUsageRow } from "util/ResultCalculations";
import { dollarFormatter, numberFormatter } from "util/Util";
import { alternativeResultsStyles } from "../styles/alternativeResultsStyles";
import { styles } from "../styles/pdfStyles";

type NpvAltCashflowTableProps = {
    headers: string[];
    rows: AlternativeNpvCostTypeTotalRow[];
};

export function NpvAltCashflowTable({ headers, rows }: NpvAltCashflowTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>NPV Cash Flow Comparison</Text>
            <View style={{ marginBottom: 10, maxWidth: 390 }}>
                {/* results Table Header */}
                <View style={alternativeResultsStyles.container}>
                    {headers.map((header, i) => (
                        <Text style={alternativeResultsStyles.value} key={`${header}_lcc_${i}`}>
                            {header}
                        </Text>
                    ))}
                </View>

                {rows.map((alt, i) => (
                    <View style={alternativeResultsStyles.row} key={`${alt.category}_lcc_${i}`}>
                        <Text style={alternativeResultsStyles.alt}>{alt.category}</Text>
                        <Text style={alternativeResultsStyles.alt}>{alt.subcategory}</Text>
                        <Text style={alternativeResultsStyles.alt}>{dollarFormatter.format(alt.alternative ?? 0)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

type NpvAltResourceTableProps = {
    headers: string[];
    rows: ResourceUsageRow[];
};

export function NpvAltResourceTable({ headers, rows }: NpvAltResourceTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Energy and Water use, Emissions, and Social Cost of GHG</Text>
            <View style={{ marginBottom: 10, maxWidth: 520 }}>
                {/* results Table Header */}
                <View style={alternativeResultsStyles.container}>
                    {headers.map((header) => (
                        <Text style={alternativeResultsStyles.value} key={`${header}_altResource`}>
                            {header}
                        </Text>
                    ))}
                </View>

                {rows.map((alt, index: number) => (
                    <View key={`${alt.category}_altResource_row_${index}`} style={alternativeResultsStyles.row}>
                        <Text style={alternativeResultsStyles.alt}>{alt.category}</Text>
                        <Text style={{ ...alternativeResultsStyles.alt, width: 125 }}>{alt.subcategory}</Text>
                        <Text style={alternativeResultsStyles.alt}>
                            {numberFormatter.format(alt.consumption ?? 0)} {index < 6 ? "gJ" : "Liter(s)"}
                        </Text>
                        <Text style={alternativeResultsStyles.alt}>
                            {numberFormatter.format(alt.emissions ?? 0)} {index < 6 ? "kg CO2e" : ""}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
