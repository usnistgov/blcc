import DataGrid from "react-data-grid";
import { bind } from "@react-rxjs/core";
import { alternativeNames$ } from "../../../model/ResultModel";
import { map } from "rxjs/operators";

type Row = {
    name: string;
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
        ...cellClasses
    },
    {
        name: "Initial Cost",
        ...cellClasses
    },
    {
        name: "SIR",
        ...cellClasses
    },
    {
        name: "AIRR",
        ...cellClasses
    },
    {
        name: "SPP",
        ...cellClasses
    },
    {
        name: "DPP",
        ...cellClasses
    },
    {
        name: "Change in Energy",
        ...cellClasses
    },
    {
        name: "Change in GHG",
        ...cellClasses
    },
    {
        name: "Change in SCC",
        ...cellClasses
    },
    {
        name: "Net Savings and SCC Reductions",
        ...cellClasses
    }
];

const [useRows] = bind(
    alternativeNames$.pipe(
        map((names) =>
            [...names.values()].map(
                (name) =>
                    ({
                        name
                    }) as Row
            )
        )
    ),
    []
);

export default function LifecycleResultsToBaseline() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                rows={rows}
                className={"h-fit"}
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
