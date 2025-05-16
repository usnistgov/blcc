import { View } from "@react-pdf/renderer";
import type { AltResults, Annual, GraphSources, Summary } from "blcc-format/ExportTypes";
import { AnalysisType, type Alternative, type Project } from "blcc-format/Format";
import { styles } from "./pdfStyles";
import { Title } from "./components/GeneralComponents";
import AnnualResultsPdf from "./results/AnnualResultsPdf";
import ResultsSummary from "./results/ResultsSummary";
import AlternativeResultsPdf from "./results/AlternativeResultsPdf";
import ERCIPPdf from "./results/ERCIPPdf";

type ResultsProps = {
    project: Project;
    alternatives: Alternative[];
    summary: Summary;
    annual: Annual;
    altResults: AltResults;
    graphs: GraphSources;
};

export default function Results({ alternatives, summary, annual, altResults, graphs }: ResultsProps) {
    const altNames = alternatives.map((alternative) => alternative.name);

    return (
        <View style={styles.section}>
            <Title title="Results" />
            <ResultsSummary alternatives={alternatives} summary={summary} />
            <AnnualResultsPdf
                alternatives={alternatives}
                annual={annual}
                annualCashFlows={graphs.annualCashFlows}
                cashFlowBySubtype={graphs.cashFlowBySubtype}
            />
            <AlternativeResultsPdf
                altNames={altNames}
                altResults={altResults}
                shareOfLcc={graphs.shareOfLcc}
                shareOfEnergyUse={graphs.shareOfEnergyUse}
            />
        </View>
    );
}
