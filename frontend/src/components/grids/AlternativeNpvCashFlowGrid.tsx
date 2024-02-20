import DataGrid from "react-data-grid";

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

const columns = [
    { name: "Year", key: "year", headerCellClass: "bg-primary text-white" },
    { name: "Investment", key: "investment", headerCellClass: "bg-primary text-white" },
    {
        name: "Energy",
        headerCellClass: "bg-primary text-white",
        children: [
            { name: "Consumption", key: "consumption", headerCellClass: "bg-primary text-white" },
            { name: "Demand", key: "demand", headerCellClass: "bg-primary text-white" },
            { name: "Rebates", key: "rebates", headerCellClass: "bg-primary text-white" }
        ]
    },

    {
        name: "Water",
        headerCellClass: "bg-primary text-white",
        children: [
            { name: "Use", key: "waterUse", headerCellClass: "bg-primary text-white" },
            { name: "Disposal", key: "waterDisposal", headerCellClass: "bg-primary text-white" }
        ]
    },
    {
        name: "OMR",
        headerCellClass: "bg-primary text-white",
        children: [
            { name: "Recurring", key: "recurring", headerCellClass: "bg-primary text-white" },
            { name: "Non-Recurring", key: "nonRecurring", headerCellClass: "bg-primary text-white" }
        ]
    },
    { name: "Replace", key: "replace", headerCellClass: "bg-primary text-white" },
    { name: "Residual Value", key: "residualValue", headerCellClass: "bg-primary text-white" },
    { name: "Total", key: "total", headerCellClass: "bg-primary text-white" }
];

export default function AlternativeNpvCashFlowGrid() {
    return (
        <div className={"overflow-hidden rounded shadow-lg"}>
            <DataGrid
                rows={[]}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                columns={columns}
                style={{
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551"
                }}
                rowClass={(_row: Row, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                rowGetter={[]}
                rowsCount={[].length}
            />
        </div>
    );
}
