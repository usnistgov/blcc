import { View } from "@react-pdf/renderer";
import type { AltResults, Annual, ERCIPData, GraphSources, Summary } from "blcc-format/ExportTypes";
import { AnalysisType, type Cost, type Alternative, type Project } from "blcc-format/Format";
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
    costs: Cost[];
    annual: Annual;
    altResults: AltResults;
    ercip: ERCIPData;
    graphs: GraphSources;
};

export default function Results({
    project,
    alternatives,
    summary,
    costs,
    annual,
    altResults,
    ercip,
    graphs,
}: ResultsProps) {
    const altNames = alternatives.map((alternative) => alternative.name);
    const nonBaseAltERCIP = alternatives.filter((alt) => !alt.ERCIPBaseCase)[0];

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
            {project.analysisType === AnalysisType.MILCON_ECIP && (
                <ERCIPPdf
                    key={nonBaseAltERCIP.id}
                    project={project}
                    alternative={nonBaseAltERCIP}
                    costs={costs}
                    ercip={ercip}
                />
            )}
        </View>
    );
}
