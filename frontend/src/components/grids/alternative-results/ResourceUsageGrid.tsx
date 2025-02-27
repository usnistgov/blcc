import { bind } from "@react-rxjs/core";
import { ResultModel } from "model/ResultModel";
import DataGrid from "react-data-grid";
import { map } from "rxjs/operators";
import { type ResourceUsageRow, createResourceUsageRow } from "util/ResultCalculations";
import { dollarFormatter, numberFormatter, wholeNumberFormatter } from "util/Util";

const cellClasses = {
    headerCellClass: "bg-primary text-white text-right",
    cellClass: "text-ink",
};

const columns = [
    {
        name: "Resource Type",
        key: "category",
        colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
        headerCellClass: "bg-primary text-white text-left",
        cellClass: "text-ink",
    },
    {
        name: "Subcategory",
        key: "subcategory",
        headerCellClass: "bg-primary text-white text-left",
        cellClass: "text-ink",
    },
    {
        name: "Consumption",
        key: "consumption",
        renderCell: ({ row, rowIdx }: { row: ResourceUsageRow; rowIdx: number }) => (
            <p className={"text-right"}>
                {wholeNumberFormatter.format(row.consumption ?? 0)} {rowIdx < 6 && "gJ"} {rowIdx === 6 && "Liter(s)"}
            </p>
        ),
        ...cellClasses,
    },
    {
        name: "Emissions",
        key: "emissions",
        renderCell: ({ row, rowIdx }: { row: ResourceUsageRow; rowIdx: number }) => (
            <p className={"text-right"}>
                {rowIdx < 6 && wholeNumberFormatter.format(row.emissions)} {rowIdx < 6 && "kg CO2e"}
            </p>
        ),
        ...cellClasses,
    },
];

const [useRows] = bind(ResultModel.selectedMeasure$.pipe(map((measure) => createResourceUsageRow(measure))), []);

export default function ResourceUsageGrid() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"h-full"}
                rows={rows}
                columns={columns}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: ResourceUsageRow, index: number) =>
                    index % 2 === 0 ? "bg-white" : "bg-base-lightest"
                }
            />
        </div>
    );
}
