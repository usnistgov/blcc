import DataGrid from "react-data-grid";
import { bind } from "@react-rxjs/core";
import { alternativeNames$, measures$ } from "../../../model/ResultModel";
import { map } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { dollarFormatter } from "../../../util/Util";
import { baselineID$ } from "../../../model/Model";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";

type Row = {
    name: string;
    baseline: boolean;
    sir: number;
    airr: number;
    spp: number;
    dpp: number;
    initialCost: number;
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
            <p className={"text-right"}>{dollarFormatter.format(row["initialCost"] ?? 0)}</p>
        ),
        ...cellClasses
    },
    {
        name: "SIR",
        key: "sir",
        ...cellClasses
    },
    {
        name: "AIRR",
        key: "airr",
        ...cellClasses
    },
    {
        name: "SPP",
        key: "spp",
        ...cellClasses
    },
    {
        name: "DPP",
        key: "dpp",
        ...cellClasses
    },
    {
        name: "ΔEnergy",
        key: "deltaEnergy",
        ...cellClasses
    },
    {
        name: "ΔGHG",
        key: "deltaGhg",
        ...cellClasses
    },
    {
        name: "ΔSCC",
        key: "deltaScc",
        ...cellClasses
    },
    {
        name: "Net Savings and SCC Reductions",
        key: "netSavings",
        ...cellClasses
    }
];

const [useRows] = bind(
    combineLatest([measures$, alternativeNames$, baselineID$]).pipe(
        map(([measures, names, baselineID]) => {
            return measures.map((measure) => {
                return {
                    name: names.get(measure.altId),
                    baseline: measure.altId === baselineID,
                    sir: measure.sir,
                    airr: measure.airr,
                    spp: measure.spp,
                    dpp: measure.dpp,
                    initialCost: measure.totalCosts
                };
            });
        })
    ),
    []
);

export default function LifecycleResultsToBaseline() {
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
