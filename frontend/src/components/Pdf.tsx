import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type {
	AltResults,
	Annual,
	GraphSources,
	Summary,
} from "blcc-format/ExportTypes";
import type { Alternative, Cost, Project } from "blcc-format/Format";
import Alternatives from "components/pdf/Alternatives";
import GeneralInformation from "components/pdf/GeneralInformation";
import NISTHeader from "components/pdf/NISTHeader";
import PageNumber from "components/pdf/PageNumber";
import PdfDisclaimer from "components/pdf/PdfDisclaimer";
import Results from "components/pdf/Results";
import { styles } from "components/pdf/pdfStyles";

type PdfProps = {
	project: Project;
	alternatives: Alternative[];
	costs: Cost[];
	summary: Summary;
	annual: Annual;
	altResults: AltResults;
	graphSources: GraphSources;
};

export default function Pdf({
	project,
	alternatives,
	costs,
	summary,
	annual,
	altResults,
	graphSources,
}: PdfProps) {
	return (
		<Document>
			<Page style={styles.page} size="LETTER">
				<NISTHeader />
				<View style={styles.blccHeader}>
					<Image style={styles.logo} src="images/logo.png" />
					<Text style={styles.date}>
						Report Generated:{" "}
						{`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
					</Text>
				</View>
				<GeneralInformation project={project} />
				<PageNumber />
			</Page>
			<Page size="LETTER">
				<NISTHeader />
				<Alternatives
					alts={alternatives}
					costs={costs}
					releaseYear={project.releaseYear}
					project={project}
				/>
				<PageNumber />
			</Page>
			<Page size="LETTER">
				<NISTHeader />
				<Results
					alternatives={alternatives}
					summary={summary}
					annual={annual}
					altResults={altResults}
					graphs={graphSources}
				/>
				<PdfDisclaimer />
				<PageNumber />
			</Page>
		</Document>
	);
}
