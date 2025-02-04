import { bind } from "@react-rxjs/core";
import { ResultModel } from "model/ResultModel";
import DataGrid, { type Column } from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { type AlternativeNpvCashflowRow, createAlternativeNpvCashflowRow } from "util/ResultCalculations";
import { dollarFormatter } from "util/Util";

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink",
};

const columns = [
    { name: "Year", key: "year", ...cellClasses },
    {
        name: "Investment",
        key: "investment",
        renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.investment)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Energy",
        ...cellClasses,
        children: [
            {
                name: "Consumption",
                key: "consumption",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.consumption ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Demand",
                key: "demand",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.demand ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Rebates",
                key: "rebates",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.rebates ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ],
    },

    {
        name: "Water",
        ...cellClasses,
        children: [
            {
                name: "Use",
                key: "waterUse",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.waterUse ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Disposal",
                key: "waterDisposal",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.waterDisposal ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ],
    },
    {
        name: "OMR",
        ...cellClasses,
        children: [
            {
                name: "Recurring",
                key: "recurring",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.recurring ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Non-Recurring",
                key: "nonRecurring",
                renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.nonRecurring ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ],
    },
    {
        name: "Replace",
        key: "replace",
        renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.replace ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Residual Value",
        key: "residualValue",
        renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.residualValue ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Total",
        key: "total",
        renderCell: ({ row }: { row: AlternativeNpvCashflowRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.total)}</p>
        ),
        ...cellClasses,
    },
] as Column<AlternativeNpvCashflowRow>[];

const [useRows] = bind(
    combineLatest([ResultModel.required$, ResultModel.optionalsByTag$, ResultModel.selection$]).pipe(
        map(([allRequired, optionals, selectedID]) =>
            createAlternativeNpvCashflowRow(allRequired, optionals, selectedID),
        ),
    ),
    [],
);

export default function AlternativeNpvCashFlowGrid() {
    const rows = useRows();

    return (
        <div className={"overflow-hidden rounded shadow-lg"}>
            <DataGrid
                rows={rows}
                columns={columns}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: AlternativeNpvCashflowRow, index: number) =>
                    index % 2 === 0 ? "bg-white" : "bg-base-lightest"
                }
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
