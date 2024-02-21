import DataGrid from "react-data-grid";
import { required$ } from "../../../model/ResultModel";
import { bind } from "@react-rxjs/core";
import { map } from "rxjs/operators";

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
    { name: "Investment", key: "investment", ...cellClasses },
    {
        name: "Energy",
        ...cellClasses,
        children: [
            { name: "Consumption", key: "consumption", ...cellClasses },
            { name: "Demand", key: "demand", ...cellClasses },
            { name: "Rebates", key: "rebates", ...cellClasses }
        ]
    },

    {
        name: "Water",
        ...cellClasses,
        children: [
            { name: "Use", key: "waterUse", ...cellClasses },
            { name: "Disposal", key: "waterDisposal", ...cellClasses }
        ]
    },
    {
        name: "OMR",
        ...cellClasses,
        children: [
            { name: "Recurring", key: "recurring", ...cellClasses },
            { name: "Non-Recurring", key: "nonRecurring", ...cellClasses }
        ]
    },
    { name: "Replace", key: "replace", ...cellClasses },
    { name: "Residual Value", key: "residualValue", ...cellClasses },
    { name: "Total", key: "total", ...cellClasses }
];

const [useRows] = bind(
    required$.pipe(
        map((required) => {
            return required[0].totalCostsDiscounted.map((_, year) => ({ year }));
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
