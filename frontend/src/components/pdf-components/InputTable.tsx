import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Cost } from "blcc-format/Format";
import InputTableRows from "./InputTableRows";

const border = "1px solid #000";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        width: "180px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border
    },
    year: {
        width: "50px",
        borderRight: border,
        fontSize
    },
    value: {
        width: "130px",
        fontSize
    }
});

const InputTable = (props: { cost: Cost; header: string; inputRows: number[]; year: number }) => {
    //TODO: specify type for cost

    const { header, inputRows, year } = props;

    const tableRows = inputRows?.map((val: number, idx: number) => {
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
