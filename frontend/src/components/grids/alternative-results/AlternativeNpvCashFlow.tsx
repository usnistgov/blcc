import { bind } from "@react-rxjs/core";
import { ResultModel } from "model/ResultModel";
import DataGrid from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { dollarFormatter } from "util/Util";

type Row = {
    category: string;
    subcategory: string;
    alternative: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink",
};

const [useColumns] = bind(
    ResultModel.selectedAlternative$.pipe(
        map((alternative) => [
            {
                name: "Cost Type",
                key: "category",
                colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
                ...cellClasses,
            },
            {
                name: "subcategory",
                key: "subcategory",
                ...cellClasses,
            },
            {
                name: alternative.name,
                key: "alternative",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.alternative ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ]),
    ),
    [],
);

const [useRows] = bind(
    combineLatest([ResultModel.selectedMeasure$]).pipe(
        map(([measure]) => {
            return [
                { category: "Investment", alternative: measure.totalTagFlows["Initial Investment"] },
                { category: "Energy", subcategory: "Consumption", alternative: measure.totalTagFlows.Energy },
                { subcategory: "Demand" },
                { subcategory: "Rebates" },
                { category: "Water", subcategory: "Usage" },
                { subcategory: "Disposal " },
                { category: "OMR", subcategory: "Recurring", alternative: measure.totalTagFlows["OMR Recurring"] },
                { subcategory: "Non-Recurring", alternative: measure.totalTagFlows["OMR Non-Recurring"] },
                { category: "Replacement" },
                { category: "Residual Value" },
            ];
        }),
    ),
    [],
);

export default function AlternativeNpvCashFlow() {
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
                rowClass={(_row: Row, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
            />
        </div>
    );
}
