import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";

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
    { name: "Year", key: "year" },
    { name: "Investment", key: "investment" },
    {
        name: "Energy",
        children: [
            { name: "Consumption", key: "consumption" },
            { name: "Demand", key: "demand" },
            { name: "Rebates", key: "rebates" }
        ]
    },

    {
        name: "Water",
        children: [
            { name: "Use", key: "waterUse" },
            { name: "Disposal", key: "waterDisposal" }
        ]
    },
    { name: "Disposal", key: "waterDisposal" },
    {
        name: "OMR",
        children: [
            { name: "Recurring", key: "recurring" },
            { name: "Non-Recurring", key: "nonRecurring" }
        ]
    },
    { name: "Non-Recurring", key: "nonRecurring" },
    { name: "Replace", key: "replace" },
    { name: "Residual Value", key: "residualValue" },
    { name: "Total", key: "total" }
];

export default function AlternativeNpvCashFlowGrid() {
    return <DataGrid rowKeyGetter={(row: Row) => row.year} rows={[]} columns={columns} />;
}
