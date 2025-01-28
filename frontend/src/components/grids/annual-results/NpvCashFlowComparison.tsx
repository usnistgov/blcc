import { bind } from "@react-rxjs/core";
import DataGrid, { type Column } from "react-data-grid";
import { type Observable, from, switchMap, zip } from "rxjs";
import { map, toArray } from "rxjs/operators";
import "react-data-grid/lib/styles.css";
import type { Required } from "@lrd/e3-sdk";
import type { Alternative } from "blcc-format/Format";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { db } from "model/db";
import { dollarFormatter } from "util/Util";

type Row = {
    key: number;
    year: number;
    [key: string]: number;
};

type SummaryRow = {
    key: string;
} & {
    [key: string]: number;
};

const requiredWithAlternative$: Observable<[Required, Alternative | undefined][]> = ResultModel.required$.pipe(
    switchMap(async (required) => {
        return await Promise.all(
            required.map(async (req) => {
                const alternative = await db.alternatives.get(req.altId);
                return [req, alternative] as [Required, Alternative | undefined];
            }),
        );
    }),
);

const [useColumns] = bind(
    alternatives$.pipe(
        map((values) => {
            const cols = values.map(
                (alternative, i) =>
                    ({
                        name: alternative?.name,
                        key: i.toString(),
                        editable: false,
                        renderHeaderCell: ({ column }: { column: Column<Row> }) => (
                            <p className={"text-right"}>{column.name}</p>
                        ),
                        renderCell: ({ row }: { row: { [x: string]: number | bigint } }) => (
                            <p className={"text-right"}>{dollarFormatter.format(row[i.toString()])}</p>
                        ),
                        headerCellClass: "bg-primary text-white",
                        cellClass: "text-ink",
                        renderSummaryCell: ({ row }: { row: SummaryRow }) => (
                            <p className={"text-right font-bold"}>
                                {alternative?.name ? dollarFormatter.format(row[alternative?.name]) : "N/A"}
                            </p>
                        ),
                    }) as Column<Row>,
            );

            cols.unshift({
                name: "Year",
                key: "year",
                editable: false,
                locked: true,
                headerCellClass: "bg-primary text-white",
                cellClass: "text-ink",
                renderSummaryCell: () => <p className={"font-bold"}>Total</p>,
            } as Column<Row>);

            return cols;
        }),
    ),
    [],
);

const [useRows] = bind(
    ResultModel.required$.pipe(
        switchMap((required) =>
            zip(required.map((required) => from(required.totalCostsDiscounted))).pipe(
                map((values, year) => {
                    const result = { key: year, year } as Row;
                    values.forEach((value, i) => {
                        result[i.toString()] = value;
                    });
                    return result;
                }),
                toArray(),
            ),
        ),
    ),
    [] as Row[],
);

const [useSummary] = bind(
    requiredWithAlternative$.pipe(
        map((values) =>
            values.reduce(
                (accumulator, [required, alternative]) => {
                    if (alternative?.name)
                        accumulator[alternative.name] = required.totalCostsDiscounted.reduce((a, b) => a + b, 0);

                    return accumulator;
                },
                { key: "totals" } as SummaryRow,
            ),
        ),
    ),
    { key: "totals" } as SummaryRow,
);

export default function NpvCashFlowComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                rows={rows}
                // @ts-ignore
                columns={useColumns()}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: Row, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                bottomSummaryRows={[useSummary()]}
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
