import { Text, View } from "@react-pdf/renderer";
import type { AltResults, Annual, Summary } from "blcc-format/ExportTypes";
import type { Alternative } from "blcc-format/Format";
import AlternativeResultsPdf from "./Results/AlternativeResultsPdf";
import AnnualResultsPdf from "./Results/AnnualResultsPdf";
import ResultsSummary from "./Results/ResultsSummary";
import { styles } from "./styles/pdfStyles";

type ResultsProps = {
    alternatives: Alternative[];
    summary: Summary;
    annual: Annual;
    altResults: AltResults;
    graphs: string[];
};

export default function Results({ alternatives, summary, annual, altResults, graphs }: ResultsProps) {
    const altNames = alternatives.map((alternative) => alternative.name);

    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Results</Text>
            </View>
            <hr style={styles.titleDivider} />
            <ResultsSummary altNames={altNames} summary={summary} />
            <AnnualResultsPdf altNames={altNames} annual={annual} graphs={graphs} />
            <AlternativeResultsPdf altNames={altNames} altResults={altResults} />
        </View>
    );
}
