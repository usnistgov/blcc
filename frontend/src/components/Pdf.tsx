import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

import Alternatives from "./pdf-components/Alternatives";
import GeneralInformation from "./pdf-components/GeneralInformation";
import PdfDisclaimer from "./pdf-components/PdfDisclaimer";

const styles = StyleSheet.create({
    section: {
        display: "flex",
        flexDirection: "column",
        padding: 50,
        border: "1px solid black"
    },
    title: {
        fontSize: 24,
        textAlign: "center"
    },
    pageNumber: {
        position: "absolute",
        fontSize: 12,
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: "center",
        color: "grey"
    },
    mainHeader: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 25
    },
    headerNistLogo: {
        display: "flex",
        justifyContent: "flex-end",
        width: "80px",
        height: "20px",
        alignSelf: "flex-end"
    },
    logo: {
        display: "flex",
        justifyContent: "center",
        width: "400px",
        height: "60px",
        marginBottom: 10
    },
    date: {
        display: "flex",
        justifyContent: "flex-end",
        fontSize: 14
    }
});

const Pdf = () => {
    return (
        <Document>
            <Page size="LETTER">
                <View fixed style={styles.mainHeader}>
                    {/* <Image
                        style={{ ...styles.headerNistLogo, marginBottom: 25 }}
                        src={"/images/645px-nist_logo-svg_1.png"}
                    />
                    <br />
                    <Image style={styles.logo} src={"/images/logo.png"} /> */}
                    <Text style={styles.date}>
                        Report Generated: {`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
                    </Text>
                </View>
                <GeneralInformation />

                <Text
                    fixed
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                />
            </Page>
            <Page size="LETTER">
                <Alternatives />
            </Page>
            <Page size="LETTER">
                <PdfDisclaimer />
            </Page>
        </Document>
    );
};

export default Pdf;
