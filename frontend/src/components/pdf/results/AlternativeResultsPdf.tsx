import { Text, View, Image } from "@react-pdf/renderer";
import type { AltResults } from "blcc-format/ExportTypes";
import { styles } from "../pdfStyles";
import { NpvAltCashflowTable, NpvAltResourceTable } from "./AlternativeResultsTables";
import { Title } from "../components/GeneralComponents";
import { dollarFormatter, wholeNumberFormatter } from "util/Util";
import type { ResourceUsageRow } from "util/ResultCalculations";

type AlternativeResultsPdfProps = {
    altNames: string[];
    altResults: AltResults;
    shareOfLcc: string[];
    shareOfEnergyUse: string[];
};

export default function AlternativeResultsPdf({
    altNames,
    altResults,
    shareOfLcc,
    shareOfEnergyUse,
}: AlternativeResultsPdfProps) {
    return (
        <View style={styles.section} break>
            <Title title="Annual Results for Alternative" />
            <View>
                {altNames.map((name, index) => (
                    <View key={name}>
                        <Text>{name}</Text>
                        <NpvAltCashflowTable
                            columns={[
                                { name: "Cost Type", key: "category" },
                                { name: "", key: "subcategory" },
                                { name: name, key: "alternative", formatter: dollarFormatter },
                            ]}
                            rows={altResults.alternativeNpvByCostType[index]}
                        />
                        <NpvAltResourceTable
                            columns={[
                                { name: "Resource Type", key: "category" },
                                { name: "", key: "subcategory" },
                                {
                                    name: "Consumption",
                                    key: "consumption",
                                    renderCell: (row: ResourceUsageRow) => {
                                        return (
                                            <Text style={styles.smallFontSize}>
                                                {wholeNumberFormatter.format(row.consumption ?? 0)} gJ
                                            </Text>
                                        );
                                    },
                                },
                                {
                                    name: "Emissions",
                                    key: "emissions",
                                    renderCell: (row: ResourceUsageRow) => {
                                        return (
                                            <Text style={styles.smallFontSize}>
                                                {wholeNumberFormatter.format(row.emissions ?? 0)} kg CO2e
                                            </Text>
                                        );
                                    },
                                },
                            ]}
                            rows={altResults?.resourceUsage?.[index]}
                        />
                        <View wrap={false}>
                            <Text style={styles.subHeading}>Share of LCC</Text>
                            <Image key={shareOfLcc[index]} src={shareOfLcc[index]} />
                        </View>
                        <View wrap={false}>
                            <Text style={styles.subHeading}>Share of Energy Use</Text>
                            <Image key={shareOfEnergyUse[index]} src={shareOfEnergyUse[index]} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
