import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
    page: {
        margin: "10px",
        border: "1px solid black"
    },
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
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20
    },
    heading: {
        fontSize: 14,
        color: "rgba(0, 0, 0, 0.88)"
    },
    key: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 4
    },
    desc: {
        maxWidth: "100vw",
        marginBottom: 4,
        fontSize: 10
    },
    text: {
        fontSize: 10,
        color: "#005fa3ff"
    },
    subHeading: {
        fontSize: 13,
        textDecoration: "underline",
        textDecorationStyle: "solid",
        textAlign: "center",
        margin: "auto",
        marginBottom: 4
    },
    value: {
        fontSize: 10,
        marginBottom: 3
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
    },
    table: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    subDivider: {
        border: "1px solid black",
        margin: "15px auto",
        width: "50%"
    },
    costContainer: {
        padding: "10px 20px"
    }
});
