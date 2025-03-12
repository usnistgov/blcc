import { Text, View } from "@react-pdf/renderer";
import type { CategorySubcategoryRow, LccBaselineRow, LccComparisonRow, LCCResourceRow } from "util/ResultCalculations";
import { Grid, type GridCol } from "../components/GeneralComponents";
import { styles } from "../pdfStyles";

type LccResultsTableProps = {
    columns: GridCol[];
    rows: LccComparisonRow[];
};

export function LCCResultsTable({ columns, rows }: LccResultsTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Life Cycle Results Comparison</Text>
            <Grid columns={columns} rows={rows} containerStyle={{ marginBottom: 10 }} />
        </View>
    );
}

type LccBaselineTableProps = {
    columns: GridCol[];
    rows: LccBaselineRow[];
};

export function LCCBaselineTable({ columns, rows }: LccBaselineTableProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Life Cycle Results Relative to Baseline Alternative</Text>
            <Grid columns={columns} rows={rows} containerStyle={{ marginBottom: 10 }} />
        </View>
    );
}

type NpvSubCatProps = {
    columns: GridCol[];
    rows: CategorySubcategoryRow[];
};

export function NPVSubTable({ columns, rows }: NpvSubCatProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>NPV Costs by Cost Subcategory</Text>
            <Grid containerStyle={{ marginBottom: 10, maxWidth: 500 }} columns={columns} rows={rows} />
        </View>
    );
}

type LCCResourceProps = {
    columns: GridCol[];
    rows: LCCResourceRow[];
};

export function LCCResourceTable({ columns, rows }: LCCResourceProps) {
    return (
        <View wrap={false}>
            <Text style={styles.subHeading}>Life Cycle Resource Consumption and Emissions Comparison</Text>
            <Grid containerStyle={{ marginBottom: 10, maxWidth: 500 }} columns={columns} rows={rows} />
        </View>
    );
}
