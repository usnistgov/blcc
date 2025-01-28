import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { Project } from "blcc-format/Format";

import { db } from "model/db";
import { altResults, annual, summary } from "./allResultStreams";
import Alternatives from "./pdf-components/Alternatives";
import GeneralInformation from "./pdf-components/GeneralInformation";
import NISTHeader from "./pdf-components/NISTHeader";
import PageNumber from "./pdf-components/PageNumber";
import PdfDisclaimer from "./pdf-components/PdfDisclaimer";
import { styles } from "./pdf-components/pdfStyles";
import Results from "./pdf-components/Results";

const fetchData = async () => {
    try {
        const [alternatives, costs] = await Promise.all([
            db.alternatives.toArray().then((result) => {
                if (result === undefined || result.length === 0) {
                    console.log("No alternatives found.");
                    return [];
                }
                return result;
            }),
            db.costs.toArray().then((result) => {
                if (result === undefined || result.length === 0) {
                    console.log("No costs found.");
                    return [];
                }
                return result;
            })
        ]);
        return [alternatives, costs];
    } catch (error) {
        console.error("Error fetching data:", error);
        return [[], []];
    }
};

const [alternatives, costs] = await fetchData();

const Pdf = (props: {
    project: Project[] | undefined;
    summary: summary;
    annual: annual;
    altResults: altResults;
    graphSources: string[];
}) => {
    const { project, summary, annual, altResults, graphSources } = props;

    console.log(project, alternatives, costs);

    return (
        <Document>
            <Page style={styles.page} size="LETTER">
                <NISTHeader />
                <View style={styles.blccHeader}>
                    <Image style={styles.logo} src="../public/logo.png" />
                    <Text style={styles.date}>
                        Report Generated: {`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
                    </Text>
                </View>
                <GeneralInformation project={project} />
                <PageNumber />
            </Page>
            <Page size="LETTER">
                <NISTHeader />
                <Alternatives alternatives={alternatives} costs={costs} releaseYear={project?.releaseYear} />
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
};

export default Pdf;
