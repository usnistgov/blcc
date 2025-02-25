import { StyleSheet } from "@react-pdf/renderer";

const border = "1px solid #000";
const fontSize = 10;

export const annualResultsStyles = StyleSheet.create({
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
        border,
        marginTop: 0,
    },
    summaryRow: {
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
        border,
        marginTop: 0,
        backgroundColor: "#c9c9c9",
    },
    value: {
        width: 100,
        fontSize,
        borderRight: "1px solid #fff",
    },
    alt: {
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
        width: 100,
    },
    altSmallText: {
        fontSize: 8,
        textAlign: "center",
        borderRight: border,
        width: 100,
    },
});
