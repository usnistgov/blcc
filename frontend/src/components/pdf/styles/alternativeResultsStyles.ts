import { StyleSheet } from "@react-pdf/renderer";

const border = "1px solid #000";
const fontSize = 10;

export const alternativeResultsStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border,
        textWrap: "wrap",
    },
    row: {
        display: "flex",
        textWrap: "wrap",
        flexDirection: "row",
        textAlign: "center",
        borderBottom: border,
        borderRight: border,
        borderLeft: border,
        marginTop: 0,
    },
    value: {
        fontSize,
        width: 130,
        borderRight: "1px solid #fff",
    },
    alt: {
        width: 130,
        fontSize: 10,
        textAlign: "center",
        borderRight: border,
    },
});
