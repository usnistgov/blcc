import { bind } from "@react-rxjs/core";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import DataGrid, { type Column } from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { type CategorySubcategoryRow, createNpvCategoryRow } from "util/ResultCalculations";
import { dollarFormatter, getOptionalTag } from "util/Util";

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
                        renderCell: ({ row }: { row: CategorySubcategoryRow }) => (
                            <p className={"text-right"}>{dollarFormatter.format(row[i.toString()] ?? 0)}</p>
                        ),
                        ...cellClasses,
                    }) as Column<CategorySubcategoryRow>,
            );

            cols.unshift(
                {
                    name: "Cost Type",
                    key: "category",
                    colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
                    headerCellClass: "bg-primary text-white text-left",
                    cellClass: "text-ink",
                },
                {
                    name: "subcategory",
                    key: "subcategory",
                    headerCellClass: "bg-primary text-white text-left",
                    cellClass: "text-ink",
                },
            );

            return cols;
        }),
    ),
    [],
);

const [useRows] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$]).pipe(
        map(([measures]) => createNpvCategoryRow(measures)),
    ),
    [],
);

export default function NpvCostsBySubcategory() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                rows={rows}
                columns={useColumns()}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: CategorySubcategoryRow, index: number) =>
                    index % 2 === 0 ? "bg-white" : "bg-base-lightest"
                }
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
