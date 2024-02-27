import DataGrid from "react-data-grid";
import { alternativeNames$, measures$, optionalsByTag$ } from "../../../model/ResultModel";
import { bind } from "@react-rxjs/core";
import { map } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { dollarFormatter } from "../../../util/Util";
import { baselineID$ } from "../../../model/Model";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";

type Row = {
    name: string;
    baseline: boolean;
    initialCost: number;
    energy: number;
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
        renderCell: ({ row }: { row: { [x: string]: number | bigint } }) => (
            <p className={"text-right"}>{dollarFormatter.format(row["initialCost"])}</p>
        ),
        ...cellClasses
    },
    {
        name: "Life Cycle Cost",
        key: "lifeCycleCost",
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
        name: "GHG Emissions",
        key: "ghgEmissions",
        ...cellClasses
    },
    {
        name: "SSC",
        key: "ssc",
        ...cellClasses
    },
    {
        name: "LCC + SCC",
        key: "lccScc",
        ...cellClasses
    }
];

const [useRows] = bind(
    combineLatest([measures$, alternativeNames$, optionalsByTag$, baselineID$]).pipe(
        map(([measures, alternativeNames, optionalMap, baselineID]) => {
            return measures.map((measure) => {
                return {
                    name: alternativeNames.get(measure.altId),
                    baseline: measure.altId === baselineID,
                    initialCost: measure.totalCosts,
                    energy: measure.totalTagFlows["Energy"]
                } as Row;
            });
        })
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
