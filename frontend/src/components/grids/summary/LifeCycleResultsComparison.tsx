import DataGrid, { Column } from "react-data-grid";
import { alternativeNames$ } from "../../../model/ResultModel";
import { bind } from "@react-rxjs/core";
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
        name: "Life Cycle Cost",
        ...cellClasses
    },
    {
        name: "Energy",
        ...cellClasses
    },
    {
        name: "GHG Emissions",
        ...cellClasses
    },
    {
        name: "SSC",
        ...cellClasses
    },
    {
        name: "LCC + SCC",
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

export default function LifecycleResultsComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
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
