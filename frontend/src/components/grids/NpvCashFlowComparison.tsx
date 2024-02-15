import DataGrid, { Column } from "react-data-grid";
import { from, switchMap, zip } from "rxjs";
import { db } from "../../model/db";
import { dollarFormatter } from "../../util/Util";
import { map, toArray } from "rxjs/operators";
import { required$ } from "../../model/ResultModel";
import { bind } from "@react-rxjs/core";
import "react-data-grid/lib/styles.css";

type Row = {
    year: number;
    [key: string]: number;
};

const [useColumns] = bind(
    required$.pipe(
        switchMap(async (required) => {
            const cols = await Promise.all(
                required.map(async (required, i) => {
                    const alternative = await db.alternatives.get(required.altId);

                    return {
                        name: alternative?.name,
                        key: i.toString(),
                        editable: false,
                        renderCell(props: { row: { [x: string]: number | bigint } }) {
                            return <p className={"text-right"}>{dollarFormatter.format(props.row[i.toString()])}</p>;
                        }
                    } as Column<Row>;
                })
            );

            cols.unshift({
                name: "Year",
                key: "year",
                editable: false,
                locked: true
            });

            return cols;
        })
    ),
    []
);

const [useRows] = bind(
    required$.pipe(
        switchMap((required) =>
            zip(required.map((required) => from(required.totalCostsDiscounted))).pipe(
                map((values, year) => {
                    const result = { year } as Row;
                    values.forEach((value, i) => (result[i.toString()] = value));
                    return result;
                }),
                toArray()
            )
        )
    ),
    []
);

export default function NpvCashFlowComparison() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return <DataGrid rowKeyGetter={(row: Row) => row.year} rows={useRows()} columns={useColumns()} />;
}
