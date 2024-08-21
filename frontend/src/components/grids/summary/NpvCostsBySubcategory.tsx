import { bind } from "@react-rxjs/core";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import DataGrid, { type Column } from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { dollarFormatter, getOptionalTag } from "util/Util";

type Row = {
    category: string;
    subcategory: string;
} & {
    [key: string]: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
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
                        renderCell: ({ row }: { row: Row }) => (
                            <p className={"text-right"}>{dollarFormatter.format(row[i.toString()] ?? 0)}</p>
                        ),
                        ...cellClasses,
                    }) as Column<Row>,
            );

            cols.unshift(
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
            );

            return cols;
        }),
    ),
    [],
);

const [useRows] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$]).pipe(
        map(([measures]) => {
            return [
                { category: "Investment", ...getOptionalTag(measures, "Initial Investment") },
                { category: "Energy", subcategory: "Consumption", ...getOptionalTag(measures, "Energy") },
                { subcategory: "Demand", ...getOptionalTag(measures, "Demand Charge") },
                { subcategory: "Rebates", ...getOptionalTag(measures, "Rebate") },
                { category: "Water", subcategory: "Usage" },
                { subcategory: "Disposal " },
                { category: "OMR", subcategory: "Recurring", ...getOptionalTag(measures, "OMR Recurring") },
                { subcategory: "Non-Recurring", ...getOptionalTag(measures, "OMR Non-Recurring") },
                { category: "Replacement", ...getOptionalTag(measures, "Replacement Capital") },
                { category: "Residual Value", ...getOptionalTag(measures, "Residual Value") },
            ];
        }),
    ),
    [],
);

export default function NpvCostsBySubcategory() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
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
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
