import { bind } from "@react-rxjs/core";
import { ResultModel } from "model/ResultModel";
import DataGrid, { type Column } from "react-data-grid";
import { combineLatest } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { type AnnualCostTypeNpvCashflowRow, createAnnualCostTypeNpvCashflowRow } from "util/ResultCalculations";
import { dollarFormatter } from "util/Util";

const cellClasses = {
    headerCellClass: "bg-primary text-white text-right",
    cellClass: "text-ink",
};

const columns = [
    { name: "Year", key: "year", headerCellClass: "bg-primary text-white text-center", cellClass: "text-ink", width: 10 },
    {
        name: "Energy",
        headerCellClass: "bg-primary text-white text-center",
        cellClass: "text-ink",
        children: [
            {
                name: "Consumption",
                key: "consumption",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.consumption ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Demand",
                key: "demand",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.demand ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Rebates",
                key: "rebates",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.rebates ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ],
    },
    {
        name: "Water",
        headerCellClass: "bg-primary text-white text-center",
        cellClass: "text-ink",
        children: [
            {
                name: "Use",
                key: "waterUse",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.waterUse ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Disposal",
                key: "waterDisposal",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.waterDisposal ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ],
    },
    {
        name: "Capital Components",
        headerCellClass: "bg-primary text-white text-center",
        cellClass: "text-ink",
        children: [
            {
                name: "Investment",
                key: "investment",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.investment ?? 0)}</p>
                ),
                ...cellClasses
            },
            {
                name: "OMR",
                key: "omr",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.omr ?? 0)}</p>
                ),
                ...cellClasses
            },
            {
                name: "Replacement",
                key: "replace",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.replace ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Residual Value",
                key: "residualValue",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.residualValue ?? 0)}</p>
                ),
                ...cellClasses,
            },
        ]
    },
    {
        name: "Contract",
        headerCellClass: "bg-primary text-white text-center",
        cellClass: "text-ink",
        children: [
            {
                name: "Non-Recurring",
                key: "implementationContract",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.implementation ?? 0)}</p>
                ),
                ...cellClasses,
            },
            {
                name: "Recurring",
                key: "recurringContract",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.recurringContract ?? 0)}</p>
                ),
                ...cellClasses,
            }
        ],
    },
    {
        name: "Other",
        headerCellClass: "bg-primary text-white text-center",
        cellClass: "text-ink",
        children: [
            {
                name: "Monetary",
                key: "otherMonetary",
                renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row.otherCosts)}</p>
                ),
                ...cellClasses,
            }
        ]
    },
    {
        name: "Total",
        key: "total",
        renderCell: ({ row }: { row: AnnualCostTypeNpvCashflowRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.total)}</p>
        ),
        ...cellClasses,
    },
] as Column<AnnualCostTypeNpvCashflowRow>[];

const [useRows] = bind(
    combineLatest([ResultModel.required$, ResultModel.optionalsByTag$, ResultModel.selection$, ResultModel.discountedCashFlow$.pipe(startWith(true))]).pipe(
        map(([allRequired, optionals, selectedID, discountedCashFlow]) =>
            createAnnualCostTypeNpvCashflowRow(allRequired, optionals, selectedID, discountedCashFlow),
        ),
    ),
    [],
);

export default function AnnualCostTypeCashFlowGrid() {
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
                rowClass={(_row: AnnualCostTypeNpvCashflowRow, index: number) =>
                    index % 2 === 0 ? "bg-white" : "bg-base-lightest"
                }
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
