import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { baselineID$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import DataGrid from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { type LccComparisonRow, createLccComparisonRows } from "util/ResultCalculations";
import { dollarFormatter, numberFormatter } from "util/Util";

const cellClasses = {
    headerCellClass: "bg-primary text-white text-right",
    cellClass: "text-ink",
};

const columns = [
    {
        name: "Alternative",
        key: "name",
        headerCellClass: "bg-primary text-white text-left",
        cellClass: "text-ink",
    },
    {
        name: "Base Case",
        key: "baseline",
        renderCell: ({ row }: { row: LccComparisonRow }) => {
            if (row.baseline)
                return (
                    <div className={"flex h-full pl-6"}>
                        <Icon className={"self-center"} path={mdiCheck} size={0.8} />
                    </div>
                );
        },
        headerCellClass: "bg-primary text-white text-left",
        cellClass: "text-ink",
    },
    {
        name: "Initial Cost",
        key: "initialCost",
        renderCell: ({ row }: { row: LccComparisonRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.initialCost)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Life Cycle Cost",
        key: "lifeCycleCost",
        renderCell: ({ row }: { row: LccComparisonRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.lifeCycleCost)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Energy",
        key: "energy",
        renderCell: ({ row }: { row: LccComparisonRow }) => (
            <p className={"text-right"}>{numberFormatter.format(row.energy ?? 0)} MWh</p>
        ),
        ...cellClasses,
    },
    {
        name: "GHG Emissions (kg co2)",
        key: "ghgEmissions",
        renderCell: ({ row }: { row: LccComparisonRow }) => (
            <p className={"text-right"}>{numberFormatter.format(row.ghgEmissions ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "SCC",
        key: "scc",
        renderCell: ({ row }: { row: LccComparisonRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.scc ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "LCC + SCC",
        key: "lccScc",
        renderCell: ({ row }: { row: LccComparisonRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.lccScc ?? 0)}</p>
        ),
        ...cellClasses,
    },
];

const [useRows] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$, baselineID$]).pipe(
        map(([measures, names, id]) => createLccComparisonRows(measures, names, id)),
    ),
    [],
);

export default function LifecycleResultsComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                // @ts-ignore
                className={"h-fit"}
                rows={rows}
                columns={columns}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: LccComparisonRow, index: number) =>
                    index % 2 === 0 ? "bg-white" : "bg-base-lightest"
                }
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
