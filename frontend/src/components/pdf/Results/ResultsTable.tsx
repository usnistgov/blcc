import { StyleSheet, Text, View } from "@react-pdf/renderer";
const border = "1px solid #000";
const fontSize = 10;

const styles = StyleSheet.create({
    container: {
        // width: "180px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#005fa3ff",
        border
    },
    year: {
        // width: "50px",
        borderRight: border,
        fontSize
    },
    value: {
        // width: "130px",
        fontSize
    }
});

const ResultsTable = (props: { headers: string[] }) => {
    //TODO: specify type for cost

    const { headers } = props;

    // const tableRows =
    //     inputRows?.map((val, idx: number) => {
    //         return [year + idx, `${val * 100}%`];
    //     }) || [];

    return (
        <View>
            {/* results Table Header */}
            <View style={styles.container}>
                {headers.map((header) => (
                    <Text style={styles.value}>{header}</Text>
                ))}
            </View>
            {/* Results Table Rows */}
            {/* <InputTableRows tableRows={tableRows} /> */}
        </View>
    );
};

export default ResultsTable;
