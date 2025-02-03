import { Image, Text, View } from "@react-pdf/renderer";
import type { Annual } from "blcc-format/ExportTypes";
import { styles } from "../pdfStyles";
import { NPVAltTable, NPVComparisonTable } from "./AnnualResultsTables";

type AnnualResultsPdfProps = {
    altNames: string[];
    annual: Annual;
    graphs: string[];
};

export default function AnnualResultsPdf({ altNames, annual, graphs }: AnnualResultsPdfProps) {
    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Annual Results</Text>
            </View>
            <hr style={styles.titleDivider} />

            <View>
                <Text style={styles.subHeading}>NPV Cash Flow Comparison</Text>
                <NPVComparisonTable headers={["Year", ...altNames]} rows={annual.npvCashflowComparison} />
                <Text style={styles.subHeading}>NPV Cash Flows</Text>
                <Text style={styles.subHeading}>Annual Results for Alternative</Text>
                {altNames?.map((name, index) => (
                    <View key={name}>
                        <Text>{name}</Text>
                        <Text style={styles.subHeading}>NPV Cash Flow by Alternative</Text>
                        <NPVAltTable rows={annual.alternativeNpvCashflows[index]} />
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
