import { Image, Text, View } from "@react-pdf/renderer";

import * as htmlToImage from "html-to-image";
import { useEffect, useState } from "react";
import { styles } from "../pdfStyles";
import { NPVAltTable, NPVComparisonTable } from "./AnnualResultsTables";

const AnnualResultsPdf = (props: { altNames: string[]; annual; graphs }) => {
    const { altNames, annual, graphs } = props;
    console.log(annual);
    // const [srcs, setSrcs] = useState([]);

    // useEffect(() => {
    //     const generateImages = async () => {
    //         const pdfGraphs = document.getElementsByClassName("result-graph");

    //         if (pdfGraphs.length === 0) return;

    //         const promises = [...pdfGraphs].map((graph) => htmlToImage.toPng(graph));

    //         try {
    //             const generatedSrcs = await Promise.all(promises);
    //             setSrcs(generatedSrcs);
    //             console.log(generatedSrcs); // Update state with generated image sources
    //         } catch (error) {
    //             console.error("Error generating images:", error);
    //         }
    //     };

    //     generateImages();
    // }, [srcs]);

    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Annual Results</Text>
            </View>
            <hr style={styles.titleDivider} />

            <View>
                <Text style={styles.subHeading}>NPV Cash Flow Comparison</Text>
                <NPVComparisonTable headers={["Year", ...altNames]} rows={annual.npvComparison} />
                <Text style={styles.subHeading}>NPV Cash Flows</Text>
                <Text style={styles.subHeading}>Annual Results for Alternative</Text>
                {altNames.map((name, index) => (
                    <View key={name}>
                        <Text>{name}</Text>
                        <Text style={styles.subHeading}>NPV Cash Flow by Alternative</Text>
                        <NPVAltTable rows={annual.NpvAll[index]} />
                        <Text style={styles.subHeading}>NPV Cash Flows</Text>
                        <Text style={styles.subHeading}>Tag/Object by Year</Text>
                    </View>
                ))}
            </View>
            <View>
                {graphs.map((src, index) => (
                    <Image key={index} src={src} />
                ))}
            </View>
        </View>
    );
};

export default AnnualResultsPdf;
