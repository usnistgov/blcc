import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { Alternative, Cost, Project } from "blcc-format/Format";

import Alternatives from "./pdf-components/Alternatives";
import GeneralInformation from "./pdf-components/GeneralInformation";
import NISTHeader from "./pdf-components/NISTHeader";
import PageNumber from "./pdf-components/PageNumber";
import PdfDisclaimer from "./pdf-components/PdfDisclaimer";
import { styles } from "./pdf-components/pdfStyles";

const Pdf = (props: { project: Project; alternatives: Alternative[]; costs: Cost[] }) => {
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
                <GeneralInformation project={props.project} />
                <PageNumber />
            </Page>
            <Page size="LETTER">
                <NISTHeader />
                <Alternatives
                    alternatives={props.alternatives}
                    costs={props.costs}
                    releaseYear={props.project.releaseYear}
                />
                <PageNumber />
            </Page>
            <Page size="LETTER">
                <NISTHeader />
                <PdfDisclaimer />
                <PageNumber />
            </Page>
        </Document>
    );
};

export default Pdf;