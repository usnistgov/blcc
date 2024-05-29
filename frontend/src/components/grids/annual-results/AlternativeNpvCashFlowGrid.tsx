import DataGrid from "react-data-grid";
import { optionalsByTag$, required$, selection$ } from "../../../model/ResultModel";
import { bind } from "@react-rxjs/core";
import { map, toArray } from "rxjs/operators";
import { combineLatest, from, switchMap, zip } from "rxjs";
import { dollarFormatter } from "../../../util/Util";

type Row = {
    year: number;
    investment: number;
    consumption: number;
    demand: number;
    rebates: number;
    waterUse: number;
    waterDisposal: number;
    recurring: number;
    nonRecurring: number;
    replace: number;
    residualValue: number;
    total: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink"
};

const columns = [
    { name: "Year", key: "year", ...cellClasses },
    {
        name: "Investment",
        key: "investment",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{dollarFormatter.format(row["total"])}</p>,
        ...cellClasses
    },
    {
        name: "Energy",
        ...cellClasses,
        children: [
            {
                name: "Consumption",
                key: "consumption",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["consumption"] ?? 0)}</p>
                ),
                ...cellClasses
            },
            {
                name: "Demand",
                key: "demand",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["demand"] ?? 0)}</p>
                ),
                ...cellClasses
            },
            {
                name: "Rebates",
                key: "rebates",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["rebates"] ?? 0)}</p>
                ),
                ...cellClasses
            }
        ]
    },

    {
        name: "Water",
        ...cellClasses,
        children: [
            {
                name: "Use",
                key: "waterUse",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["waterUse"] ?? 0)}</p>
                ),
                ...cellClasses
            },
            {
                name: "Disposal",
                key: "waterDisposal",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["waterDisposal"] ?? 0)}</p>
                ),
                ...cellClasses
            }
        ]
    },
    {
        name: "OMR",
        ...cellClasses,
        children: [
            {
                name: "Recurring",
                key: "recurring",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["recurring"] ?? 0)}</p>
                ),
                ...cellClasses
            },
            {
                name: "Non-Recurring",
                key: "nonRecurring",
                renderCell: ({ row }: { row: Row }) => (
                    <p className={"text-right"}>{dollarFormatter.format(row["nonRecurring"] ?? 0)}</p>
                ),
                ...cellClasses
            }
        ]
    },
    {
        name: "Replace",
        key: "replace",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["replace"] ?? 0)}</p>
        ),
        ...cellClasses
    },
    {
        name: "Residual Value",
        key: "residualValue",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["residualValue"] ?? 0)}</p>
        ),
        ...cellClasses
    },
    {
        name: "Total",
        key: "total",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{dollarFormatter.format(row["total"])}</p>,
        ...cellClasses
    }
];

const [useRows] = bind(
    combineLatest([required$, optionalsByTag$, selection$]).pipe(
        switchMap(([allRequired, optionals, selectedID]) => {
            const required = allRequired.find((req) => req.altId === selectedID);

            if (required === undefined) return [];

            const id = required.altId;
            const defaultArray = Array.apply(null, Array(required.totalCostsDiscounted.length)).map(() => 0);

            return zip(
                from(required.totalCostsDiscounted),
                from(optionals.get(`${id} Initial Investment`)?.totalTagCashflowDiscounted ?? defaultArray),
                from(optionals.get(`${id} Energy`)?.totalTagCashflowDiscounted ?? defaultArray),
                from(optionals.get(`${id} OMR Recurring`)?.totalTagCashflowDiscounted ?? defaultArray),
                from(optionals.get(`${id} OMR Non-Recurring`)?.totalTagCashflowDiscounted ?? defaultArray)
            ).pipe(
                map(([total, investment, consumption, recurring, nonRecurring], year) => ({
                    year,
                    investment,
                    consumption,
                    recurring,
                    nonRecurring,
                    total
                })),
                toArray()
            );
        })
    ),
    []
);

export default function AlternativeNpvCashFlowGrid() {
    const rows = useRows();

    return (
        <div className={"overflow-hidden rounded shadow-lg"}>
            <DataGrid
                rows={rows}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                columns={columns}
                style={{
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551"
                }}
                rowClass={(_row: Row, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
