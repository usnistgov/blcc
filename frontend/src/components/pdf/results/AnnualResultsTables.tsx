import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { NpvCashflowComparisonSummary } from "blcc-format/ExportTypes";
import type { AnnualCostTypeNpvCashflowRow, NpvCashflowComparisonRow } from "util/ResultCalculations";
import { Grid, type GridCol } from "../components/GeneralComponents";
import { styles } from "../pdfStyles";

type NpvComparisonTableProps = {
    columns: GridCol[];
    rows: NpvCashflowComparisonRow[];
    summary: NpvCashflowComparisonSummary;
};

export function NPVComparisonTable({ columns, rows, summary }: NpvComparisonTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.heading}>NPV Cash Flow Comparison</Text>
            <Grid
                columns={columns}
                rows={rows}
                summary={summary}
                containerStyle={{ marginBottom: 10, maxWidth: 300 }}
            />
        </View>
    );
}

type NpvAltTableProps = {
    columns: GridCol[];
    rows: AnnualCostTypeNpvCashflowRow[];
};

export function NPVAltTable({ columns, rows }: NpvAltTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Cash Flow by Cost Type</Text>
            <Grid columns={columns} rows={rows} containerStyle={{ marginBottom: 10 }} fontSize={8} />
        </View>
    );
}
