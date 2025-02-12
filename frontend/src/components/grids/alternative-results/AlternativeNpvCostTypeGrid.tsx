import { bind } from "@react-rxjs/core";
import { ResultModel } from "model/ResultModel";
import DataGrid from "react-data-grid";
import { map } from "rxjs/operators";
import { type AlternativeNpvCostTypeTotalRow, createAlternativeNpvCostTypeTotalRow } from "util/ResultCalculations";
import { dollarFormatter } from "util/Util";

const cellClasses = {
    headerCellClass: "bg-primary text-white text-right",
    cellClass: "text-ink",
};

const [useColumns] = bind(
    ResultModel.selectedAlternative$.pipe(
        map((alternative) => [
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
            {
                name: alternative.name,
                key: "alternative",
                renderCell: ({ row }: { row: AlternativeNpvCostTypeTotalRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.alternative ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ]),
    ),
    [],
);

const [useRows] = bind(
    ResultModel.selectedMeasure$.pipe(map((measure) => createAlternativeNpvCostTypeTotalRow(measure))),
    [],
);

export default function AlternativeNpvCostTypeGrid() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"h-full"}
                // @ts-ignore
                rows={rows}
                columns={useColumns()}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: AlternativeNpvCostTypeTotalRow, index: number) =>
                    index % 2 === 0 ? "bg-white" : "bg-base-lightest"
                }
            />
        </div>
    );
}
