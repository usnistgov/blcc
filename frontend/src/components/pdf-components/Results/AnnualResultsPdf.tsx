import { Text, View } from "@react-pdf/renderer";

import { styles } from "../pdfStyles";
import { NPVAltTable, NPVComparisonTable } from "./AnnualResultsTables";

const AnnualResultsPdf = (props: { altNames: string[]; annual }) => {
    const { altNames, annual } = props;
    console.log(annual);

    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Annual Results</Text>
            </View>
            <hr style={styles.titleDivider} />

            <View>
                <Text style={styles.subHeading}>NPV Cash Flow Comparison</Text>
                <NPVComparisonTable headers={["Year", ...altNames]} rows={annual.npvComparison} />
                <Text style={styles.subHeading}>NPV Cash Flows</Text>
                <Text style={styles.subHeading}>Annual Results for Alternative</Text>
                {altNames.map((name, index) => (
                    <View key={name}>
                        <Text>{name}</Text>
                        <Text style={styles.subHeading}>NPV Cash Flow by Alternative</Text>
                        <NPVAltTable rows={annual.NpvAll[index]} />
                        <Text style={styles.subHeading}>NPV Cash Flows</Text>
                        <Text style={styles.subHeading}>Tag/Object by Year</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default AnnualResultsPdf;
