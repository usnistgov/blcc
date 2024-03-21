import DataGrid from "react-data-grid";
import { alternativeNames$, measures$ } from "../../../model/ResultModel";
import { bind } from "@react-rxjs/core";
import { map } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { dollarFormatter, numberFormatter } from "../../../util/Util";
import { baselineID$ } from "../../../model/Model";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";

type Row = {
    name: string;
    baseline: boolean;
    initialCost: number;
    lifeCycleCost: number;
    energy: number;
    ghgEmissions: number;
    scc: number;
    lccScc: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink"
};

const columns = [
    {
        name: "Alternative",
        key: "name",
        ...cellClasses
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
        ...cellClasses
    },
    {
        name: "Initial Cost",
        key: "initialCost",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["initialCost"])}</p>
        ),
        ...cellClasses
    },
    {
        name: "Life Cycle Cost",
        key: "lifeCycleCost",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["lifeCycleCost"])}</p>
        ),
        ...cellClasses
    },
    {
        name: "Energy",
        key: "energy",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["energy"] ?? 0)}</p>
        ),
        ...cellClasses
    },
    {
        name: "GHG Emissions (kg co2)",
        key: "ghgEmissions",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{numberFormatter.format(row["ghgEmissions"] ?? 0)}</p>
        ),
        ...cellClasses
    },
    {
        name: "SCC",
        key: "scc",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["scc"] ?? 0)}</p>
        ),
        ...cellClasses
    },
    {
        name: "LCC + SCC",
        key: "lccScc",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["lccScc"] ?? 0)}</p>
        ),
        ...cellClasses
    }
];

const [useRows] = bind(
    combineLatest([measures$, alternativeNames$, baselineID$]).pipe(
        map(([measures, alternativeNames, baselineID]) =>
            measures.map(
                (measure) =>
                    ({
                        name: alternativeNames.get(measure.altId),
                        baseline: measure.altId === baselineID,
                        lifeCycleCost: measure.totalTagFlows["LCC"],
                        initialCost: measure.totalTagFlows["Initial Investment"],
                        energy: measure.totalTagFlows["Energy"],
                        ghgEmissions: measure.totalTagFlows["Emissions"],
                        scc: measure.totalTagFlows["SCC"],
                        lccScc: measure.totalCosts
                    }) as Row
            )
        )
    ),
    []
);

export default function LifecycleResultsComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                className={"h-fit"}
                rows={rows}
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
