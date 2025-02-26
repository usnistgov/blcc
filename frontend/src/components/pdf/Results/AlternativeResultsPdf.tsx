import { Text, View } from "@react-pdf/renderer";
import type { AltResults } from "blcc-format/ExportTypes";
import { styles } from "../styles/pdfStyles";
import { NpvAltCashflowTable, NpvAltResourceTable } from "./AlternativeResultsTables";

type AlternativeResultsPdfProps = {
    altNames: string[];
    altResults: AltResults;
};

export default function AlternativeResultsPdf({ altNames, altResults }: AlternativeResultsPdfProps) {
    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Annual Results for Alternative</Text>
            </View>
            <hr style={styles.titleDivider} />

            <View>
                {altNames.map((name, index) => (
                    <View key={name}>
                        <Text>{name}</Text>
                        <NpvAltCashflowTable
                            headers={["Cost Type", "", name]}
                            rows={altResults.alternativeNpvByCostType[index]}
                        />
                        <NpvAltResourceTable
                            headers={["Resource Type", "", "Consumption", "Emissions"]}
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
