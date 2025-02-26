import { StyleSheet } from "@react-pdf/renderer";

const border = "1px solid #000";
const fontSize = 10;

export const resultsSummaryStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
        borderBottom: border,
        borderRight: border,
        borderLeft: border,
        marginTop: 0,
        textWrap: "wrap",
    },
    value: {
        fontSize,
        textWrap: "wrap",
        borderRight: "1px solid #fff",
        width: 114,
    },
    alt: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 114,
    },
    cat: {
        width: 100,
        fontSize: 10,
        borderRight: border,
    },
    subCat: {
        width: 100,
        fontSize: 10,
        borderRight: border,
    },
    smallCol: {
        width: 75,
        fontSize: 10,
        borderRight: border,
    },
    col1: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 125,
    },
    header1: {
        fontSize,
        textWrap: "wrap",
        width: 125,
        borderRight: "1px solid #fff",
    },
});
