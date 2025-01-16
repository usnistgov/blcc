import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { JSX } from "react/jsx-runtime";

const border = "1px solid #000";

const styles = StyleSheet.create({
    row: {
        width: "180px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        textAlign: "center",
        borderBottom: border,
        borderRight: border,
        borderLeft: border,
        marginTop: 0
    },
    cell: {
        width: "130px",
        fontSize: 10,
        textAlign: "center"
    },
    alt: {
        width: "50px",
        fontSize: 10,
        textAlign: "center"
    }
});

const InputTableRows = ({ tableRows }: { tableRows }) => {
    const rows: JSX.Element[] = [];

    tableRows?.forEach((item) =>
        rows.push(
            <View style={styles.row} key={item.alt}>
                <Text style={{ ...styles.alt, borderRight: border }}>{item[0]}</Text>
                <Text style={styles.cell}>{item[1]}</Text>
            </View>
        )
    );
    return <>{rows}</>;
};

export default InputTableRows;
