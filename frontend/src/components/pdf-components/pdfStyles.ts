import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
    section: {
        display: "flex",
        flexDirection: "column",
        padding: 25
    },
    mainHeader: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12.5 25 5 25"
    },
    headerNistLogo: {
        display: "flex",
        justifyContent: "flex-end",
        width: "80px",
        height: "20px",
        alignSelf: "flex-end"
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
    blccHeader: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center"
    },
    logo: {
        display: "flex",
        justifyContent: "center",
        width: "300px",
        height: "50px",
        marginBottom: 10
    },
    title: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20
    },
    heading: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 0.88)"
    },
    key: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10
    },
    desc: {
        maxWidth: "100vw",
        marginBottom: 10
    },
    text: {
        fontSize: 14,
        color: "#979797"
    },
    value: {
        fontSize: 14,
        marginBottom: "5"
    },
    divider: {
        border: "1px solid black",
        margin: "2px 0 5px 0"
    },
    container: {
        display: "flex"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10 // space between rows
    },
    item: {
        flex: 1,
        margin: 5
    },
    date: {
        display: "flex",
        justifyContent: "flex-end",
        fontSize: 14
    }
});
