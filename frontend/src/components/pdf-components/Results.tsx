import { Text, View } from "@react-pdf/renderer";
import { Alternative } from "blcc-format/Format";

import { styles } from "./pdfStyles";
import AlternativeResultsPdf from "./Results/AlternativeResultsPdf";
import AnnualResultsPdf from "./Results/AnnualResultsPdf";
import ResultsSummary from "./Results/ResultsSummary";

const Results = (props: { alternatives: Alternative[]; summary; annual; altResults }) => {
    const { alternatives, summary, annual, altResults } = props;

    const altNames = alternatives.map((alternative) => alternative.name);

    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Results</Text>
            </View>
            <hr style={styles.titleDivider} />
            <ResultsSummary altNames={altNames} summary={summary} />
            <AnnualResultsPdf altNames={altNames} annual={annual} />
            <AlternativeResultsPdf altNames={altNames} altResults={altResults} />
        </View>
    );
};

export default Results;
