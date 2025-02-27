import { Text, View } from "@react-pdf/renderer";
import type { AlternativeNpvCostTypeTotalRow, ResourceUsageRow } from "util/ResultCalculations";
import { styles } from "../pdfStyles";
import { Grid, type GridCol } from "../components/GeneralComponents";

type NpvAltCashflowTableProps = {
    columns: GridCol[];
    rows: AlternativeNpvCostTypeTotalRow[];
};

export function NpvAltCashflowTable({ columns, rows }: NpvAltCashflowTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>NPV by Cost Type</Text>
            <Grid columns={columns} rows={rows} containerStyle={{ marginBottom: 10, maxWidth: 390 }} />
        </View>
    );
}

type NpvAltResourceTableProps = {
    columns: GridCol[];
    rows: ResourceUsageRow[];
};

export function NpvAltResourceTable({ columns, rows }: NpvAltResourceTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Resource Use and Emissions</Text>
            <Grid columns={columns} rows={rows} containerStyle={{ marginBottom: 10, maxWidth: 520 }} />
        </View>
    );
}
