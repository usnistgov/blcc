import { Text, View } from "@react-pdf/renderer";
import type { AltResults } from "blcc-format/ExportTypes";
import { styles } from "../pdfStyles";
import { NpvAltCashflowTable, NpvAltResourceTable } from "./AlternativeResultsTables";
import { Title } from "../components/GeneralComponents";
import { dollarFormatter } from "util/Util";
import type { ResourceUsageRow } from "util/ResultCalculations";

type AlternativeResultsPdfProps = {
    altNames: string[];
    altResults: AltResults;
};

export default function AlternativeResultsPdf({ altNames, altResults }: AlternativeResultsPdfProps) {
    return (
        <View style={styles.section}>
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
                                        return <Text style={styles.smallFontSize}>{row.consumption} gJ</Text>;
                                    },
                                },
                                {
                                    name: "Emissions",
                                    key: "emissions",
                                    renderCell: (row: ResourceUsageRow) => {
                                        return <Text style={styles.smallFontSize}>{row.emissions} kg CO2e</Text>;
                                    },
                                },
                            ]}
                            rows={altResults?.resourceUsage?.[index]}
                        />
                        <Text style={styles.subHeading}>Share of LCC</Text>
                        <Text style={styles.subHeading}>Share of Energy Use</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
