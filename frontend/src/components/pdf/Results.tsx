import { Text, View } from "@react-pdf/renderer";
import type { AltResults, Annual, Summary } from "blcc-format/ExportTypes";
import type { Alternative } from "blcc-format/Format";
import { styles } from "./pdfStyles";
import { Title } from "./components/GeneralComponents";
import AnnualResultsPdf from "./results/AnnualResultsPdf";
import ResultsSummary from "./results/ResultsSummary";
import AlternativeResultsPdf from "./results/AlternativeResultsPdf";

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
            <Title title="Results" />
            <ResultsSummary altNames={altNames} summary={summary} />
            <AnnualResultsPdf altNames={altNames} annual={annual} graphs={graphs} />
            <AlternativeResultsPdf altNames={altNames} altResults={altResults} />
        </View>
    );
}
