import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import DataGrid from "react-data-grid";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { baselineID$ } from "../../../model/Model";
import { alternativeNames$, measures$ } from "../../../model/ResultModel";
import { dollarFormatter, numberFormatter } from "../../../util/Util";

type Row = {
    name: string;
    baseline: boolean;
    sir: number;
    airr: number;
    spp: number;
    dpp: number;
    initialCost: number;
    deltaEnergy: number;
    deltaGhg: number;
    deltaScc: number;
    netSavings: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink",
};

const columns = [
    {
        name: "Alternative",
        key: "name",
        ...cellClasses,
    },
    {
        name: "Base Case",
        key: "baseline",
        renderCell: ({ row }: { row: Row }) => {
            if (row.baseline)
                return (
                    <div className={"flex h-full pl-6"}>
                        <Icon className={"self-center"} path={mdiCheck} size={0.8} />
                    </div>
                );
        },
        ...cellClasses,
    },
    {
        name: "Initial Cost",
        key: "initialCost",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.initialCost ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "SIR",
        key: "sir",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{numberFormatter.format(row.sir)}</p>,
        ...cellClasses,
    },
    {
        name: "AIRR",
        key: "airr",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{numberFormatter.format(row.airr)}</p>,
        ...cellClasses,
    },
    {
        name: "SPP",
        key: "spp",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{numberFormatter.format(row.spp)}</p>,
        ...cellClasses,
    },
    {
        name: "DPP",
        key: "dpp",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{numberFormatter.format(row.dpp)}</p>,
        ...cellClasses,
    },
    {
        name: "Change in Energy",
        key: "deltaEnergy",
        renderCell: ({ row }: { row: Row }) => {
            const value = row.deltaEnergy;
            if (value === undefined || Number.isNaN(value)) return undefined;

            return <p className={"text-right"}>{dollarFormatter.format(value)}</p>;
        },
        ...cellClasses,
    },
    {
        name: "Change in GHG (kg co2)",
        key: "deltaGhg",
        renderCell: ({ row }: { row: Row }) => {
            const value = row.deltaGhg;
            if (value === undefined || Number.isNaN(value)) return undefined;

            return <p className={"text-right"}>{numberFormatter.format(value)}</p>;
        },
        ...cellClasses,
    },
    {
        name: "Change in SCC",
        key: "deltaScc",
        renderCell: ({ row }: { row: Row }) => {
            const value = row.deltaScc;
            if (value === undefined || Number.isNaN(value)) return undefined;

            return <p className={"text-right"}>{dollarFormatter.format(value)}</p>;
        },
        ...cellClasses,
    },
    {
        name: "Net Savings and SCC Reductions",
        key: "netSavings",
        renderCell: ({ row }: { row: Row }) => <p className={"text-right"}>{dollarFormatter.format(row.netSavings)}</p>,
        ...cellClasses,
    },
];

const [useRows] = bind(
    combineLatest([measures$, alternativeNames$, baselineID$]).pipe(
        map(([measures, names, baselineID]) => {
            const baseline = measures.find((measure) => measure.altId === baselineID);

            console.log(measures);

            return measures.map((measure) => ({
                name: names.get(measure.altId),
                baseline: measure.altId === baselineID,
                sir: measure.sir,
                airr: measure.airr,
                spp: measure.spp,
                dpp: measure.dpp,
                initialCost: measure.totalCosts,
                deltaEnergy: (baseline?.totalTagFlows.Energy ?? 0) - measure.totalTagFlows.Energy,
                deltaGhg: (baseline?.totalTagFlows.Emissions ?? 0) - measure.totalTagFlows.Emissions,
                deltaScc: (baseline?.totalTagFlows.SCC ?? 0) - measure.totalTagFlows.SCC,
                netSavings: measure.netSavings + measure.totalTagFlows.SCC,
            }));
        }),
    ),
    [],
);

export default function LifecycleResultsToBaseline() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                // @ts-ignore
                rows={rows}
                columns={columns}
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
