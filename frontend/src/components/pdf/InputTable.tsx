import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { percentFormatter } from "util/Util";
import InputTableRows from "./InputTableRows";
import { blue } from "./pdfStyles";

const border = "1px solid #000";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        width: "180px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "white",
        textAlign: "center",
        backgroundColor: blue,
        border,
    },
    year: {
        width: "50px",
        borderRight: border,
        fontSize,
    },
    value: {
        width: "130px",
        fontSize,
    },
});

type InputTableProps = {
    header: string;
    inputRows: number[];
    year: number;
};

const InputTable = ({ header, inputRows, year }: InputTableProps) => {
    const tableRows = inputRows.map((val: number, i: number): [number, string] => [
        year + i,
        percentFormatter.format(val),
    ]);

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
