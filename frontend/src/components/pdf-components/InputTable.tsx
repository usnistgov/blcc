import { StyleSheet, Text, View } from "@react-pdf/renderer";
import InputTableRows from "./InputTableRows";

const borderRight = "1px solid #fff";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff"
    },
    year: {
        // width: "14.28%",
        borderRight,
        fontSize
    },
    value: {
        // width: "17.28%",
        fontSize,
        borderRight
    }
});

const InputTable = (props: { cost; header: string; inputRows: number[]; year: number }) => {
    //TODO: specify type for cost

    const { header, inputRows, year } = props;

    const tableRows = inputRows.map((val, idx: number) => {
        return [year + idx, `${val * 100}%`];
    });

    return (
        <View>
            {/* results Table Header */}
            <View style={styles.container}>
                <Text style={styles.year}>Year</Text>
                <Text style={styles.value}>{header}</Text>
            </View>
            {/* Results Table Rows */}
            <InputTableRows tableRows={tableRows} />
        </View>
    );
};

export default InputTable;
