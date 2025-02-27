import { StyleSheet } from "@react-pdf/renderer";

export const blue = "#005fa3";
const black = "rgb(0,0,0)";
export const lightGray = "#dbdbdb";
const smallFontSize = 10;

export const styles = StyleSheet.create({
    page: {
        margin: 10,
        // border: "1px solid black"
    },
    section: {
        display: "flex",
        flexDirection: "column",
        padding: 25,
    },
    mainHeader: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12.5 25 5 25",
    },
    headerNistLogo: {
        display: "flex",
        justifyContent: "flex-end",
        width: "80px",
        height: "20px",
        alignSelf: "flex-end",
    },
    blccHeader: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logo: {
        display: "flex",
        justifyContent: "center",
        width: "300px",
        height: "50px",
        marginBottom: 10,
    },
    date: {
        display: "flex",
        justifyContent: "flex-end",
        fontSize: 14,
    },
    pageNumber: {
        position: "absolute",
        fontSize: 12,
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: "center",
        color: "grey",
    },

    titleDivider: {
        border: "1px solid black",
        margin: "4px 0 4px 0",
    },
    titleWrapper: {
        display: "flex",
        justifyContent: "space-between",
        textAlign: "center",
    },
    title: {
        fontSize: 16,
        color: blue,
        textAlign: "center",
    },
    subTitle: {
        fontSize: 12,
        color: blue,
        fontWeight: "ultrabold",
    },
    heading: {
        fontSize: 14,
        color: "rgba(0, 0, 0, 0.88)",
        textDecoration: "underline",
        textDecorationColor: black,
        marginBottom: 8,
    },
    altHeading: {
        display: "flex",
        flexDirection: "row",
        marginTop: 8,
        marginBottom: 8,
        fontSize: 13,
        color: black,
        textAlign: "center",
        textDecoration: "underline",
        textDecorationColor: black,
        fontWeight: 800,
    },
    key: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 6,
        fontSize: smallFontSize,
    },
    text: {
        fontSize: smallFontSize,
        color: blue,
    },
    value: {
        fontSize: smallFontSize,
        marginBottom: 3,
    },
    desc: {
        maxWidth: "100vw",
        marginBottom: 4,
        fontSize: smallFontSize,
    },
    tableWrapper: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    subHeading: {
        fontSize: 12,
        textDecoration: "underline",
        textDecorationStyle: "solid",
        marginBottom: 8,
        fontWeight: "ultrabold",
        color: "#000",
    },

    divider: {
        border: "1px solid black",
        margin: "2px 0 2.5px 0",
    },
    container: {
        display: "flex",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10, // space between rows
    },
    item: {
        flex: 1,
    },

    table: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        border: "1px solid #000",
        maxWidth: "300px",
    },
    subDivider: {
        border: "1px solid black",
        margin: "15px auto",
        width: "50%",
    },
    costContainer: {
        padding: "5px 20px",
    },
    cell: {
        width: "100px",
        fontSize: smallFontSize,
        textAlign: "center",
        borderRight: "1px solid black",
        backgroundColor: blue,
        color: "#fff",
    },
    alt: {
        width: "100px",
        fontSize: smallFontSize,
        textAlign: "center",
        borderRight: "1px solid black",
    },
    tag: {
        backgroundColor: "rgb(169 174 177)",
        padding: "1.5 3",
        fontSize: smallFontSize,
        border: "1px solid #000",
        borderRadius: 2,
        marginRight: 2,
    },
    flexRow: {
        display: "flex",
        flexDirection: "row",
    },
    gridHeader: {
        backgroundColor: blue,
        color: "#ffffff",
    },
    gridItem: {
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
        flex: 1,
        padding: "2px",
    },
    smallFontSize: {
        fontSize: smallFontSize,
    },
});
