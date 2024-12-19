import { Text, View } from "@react-pdf/renderer";
import { styles } from "../pdfStyles";
import ResultsTable from "./ResultsTable";

const AlternativeResultsPdf = (props: { altNames: string[]; altResults }) => {
    const { altNames, altResults } = props;
    console.log(altResults);

    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Annual Results for Alternative</Text>
            </View>
            <hr style={styles.titleDivider} />

            <View>
                {altNames.map((name) => (
                    <View>
                        <Text>{name}</Text>
                        <Text style={styles.subHeading}>NPV Cash Flow Comparison</Text>
                        <ResultsTable headers={["Cost Type", name]} />
                        <Text style={styles.subHeading}>Energy and Water use, Emissions, and Social Cost of GHG</Text>
                        <ResultsTable headers={["Resource Type", "Consumption", "Emissions"]} />
                        <Text style={styles.subHeading}>Share of LCC</Text>
                        <Text style={styles.subHeading}>Share of Energy Use</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default AlternativeResultsPdf;
