import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { JSX } from "react/jsx-runtime";

const border = "1px solid #005fa3ff";

const styles = StyleSheet.create({
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        textAlign: "center",
        border,
        marginTop: 0
    },
    cell: { borderRight: border, padding: 2, textAlign: "right" },
    alt: {
        // width: "14.28%",
        borderRight: "1px solid #fff",
        fontSize: 10
    }
});

const InputTableRows = ({ tableRows }: { tableRows }) => {
    const rows: JSX.Element[] = [];

    tableRows?.forEach((item) =>
        rows.push(
            <View style={styles.row} key={item.alt}>
                <Text style={{ ...styles.alt, borderRight: border }}>{item[0]}</Text>
                <Text style={{ ...styles.alt, ...styles.cell }}>{item[1]}</Text>
            </View>
        )
    );
    return <>{rows}</>;
};

export default InputTableRows;
