import { bind } from "@react-rxjs/core";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import DataGrid, { type Column } from "react-data-grid";
import { map } from "rxjs/operators";
import { createLccResourceRows, type LCCResourceRow } from "util/ResultCalculations";
import { wholeNumberFormatter } from "util/Util";

const cellClasses = {
    headerCellClass: "bg-primary text-white text-right",
    cellClass: "text-ink",
};

const [useColumns] = bind(
    alternatives$.pipe(
        map((alternatives) => {
            const cols = alternatives.map(
                (alternative, i) =>
                    ({
                        name: alternative.name,
                        key: i.toString(),
                        minWidth: 75,
                        renderCell: ({ row }: { row: LCCResourceRow }) => {
                            return (
                                <p className={"text-right"}>
                                    {wholeNumberFormatter.format(row[i.toString()] ?? 0)} {row.units}
                                </p>
                            );
                        },
                        ...cellClasses,
                    }) as Column<LCCResourceRow>,
            );

            cols.unshift(
                {
                    name: "Resource Type",
                    key: "category",
                    width: 80,
                    // @ts-ignore
                    colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
                    headerCellClass: "bg-primary text-white text-left",
                    cellClass: "text-ink",
                },
                {
                    name: "Subcategory",
                    key: "subcategory",
                    width: 240,
                    headerCellClass: "bg-primary text-white text-left",
                    cellClass: "text-ink",
                },
            );

            return cols;
        }),
    ),
    [],
);

const [useRows] = bind(ResultModel.measures$.pipe(map((measures) => createLccResourceRows(measures))), []);

export default function LifeCycleResourceComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                rows={rows}
                columns={useColumns()}
                defaultColumnOptions={{
                    resizable: true,
                }}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: LCCResourceRow, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
