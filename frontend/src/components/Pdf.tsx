import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { Alternative, Cost, Project } from "blcc-format/Format";

import Alternatives from "./pdf-components/Alternatives";
import GeneralInformation from "./pdf-components/GeneralInformation";
import NISTHeader from "./pdf-components/NISTHeader";
import PageNumber from "./pdf-components/PageNumber";
import PdfDisclaimer from "./pdf-components/PdfDisclaimer";
import { styles } from "./pdf-components/pdfStyles";
import Results from "./pdf-components/Results";

const Pdf = (props: {
    project: Project;
    alternatives: Alternative[];
    costs: Cost[];
    summary;
    annual;
    altResults;
    graphSources;
}) => {
    const { project, alternatives, costs, summary, annual, altResults, graphSources } = props;
    console.log(alternatives, costs);
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
                <Alternatives alternatives={alternatives} costs={costs} releaseYear={project.releaseYear} />
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
