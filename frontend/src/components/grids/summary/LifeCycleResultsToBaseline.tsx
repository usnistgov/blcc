import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { baselineID$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import DataGrid from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { type LccBaselineRow, createLccBaselineRows } from "util/ResultCalculations";
import { dollarFormatter, numberFormatter, percentFormatter } from "util/Util";

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
        renderCell: ({ row }: { row: LccBaselineRow }) => {
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
        name: "LCC",
        key: "lcc",
        renderCell: ({ row }: { row: LccBaselineRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.lcc ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Investment",
        key: "initialCost",
        renderCell: ({ row }: { row: LccBaselineRow }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.initialCost ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "SIR",
        key: "sir",
        renderCell: ({ row }: { row: LccBaselineRow }) => (
            <p className={"text-right"}>{numberFormatter.format(row.sir)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "AIRR",
        key: "airr",
        renderCell: ({ row }: { row: LccBaselineRow }) => (
            <p className={"text-right"}>{percentFormatter.format(row.airr)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "SPP",
        key: "spp",
        renderCell: ({ row }: { row: LccBaselineRow }) => (
            <p className={"text-right"}>{numberFormatter.format(row.spp)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "DPP",
        key: "dpp",
        renderCell: ({ row }: { row: LccBaselineRow }) => (
            <p className={"text-right"}>{numberFormatter.format(row.dpp)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Change in Energy",
        key: "deltaEnergy",
        renderCell: ({ row }: { row: LccBaselineRow }) => {
            const value = row.deltaEnergy;
            if (value === undefined || Number.isNaN(value)) return undefined;

            return <p className={"text-right"}>{numberFormatter.format(value)} gJ</p>;
        },
        ...cellClasses,
    },
    {
        name: "Change in GHG (kg CO2e)",
        key: "deltaGhg",
        renderCell: ({ row }: { row: LccBaselineRow }) => {
            const value = row.deltaGhg;
            if (value === undefined || Number.isNaN(value)) return undefined;

            return <p className={"text-right"}>{numberFormatter.format(value)}</p>;
        },
        ...cellClasses,
    }
];

const [useRows] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$, baselineID$]).pipe(
        map(([measures, names, baselineID]) => createLccBaselineRows(measures, names, baselineID)),
    ),
    [],
);

export default function LifecycleResultsToBaseline() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                rows={rows}
                columns={columns}
                style={{
                    // @ts-ignore
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551",
                }}
                rowClass={(_row: LccBaselineRow, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                rowGetter={rows}
                rowsCount={rows.length}
            />
        </div>
    );
}
