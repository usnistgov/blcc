import { bind } from "@react-rxjs/core";
import { FuelType } from "blcc-format/Format";
import { ResultModel } from "model/ResultModel";
import DataGrid from "react-data-grid";
import { map } from "rxjs/operators";
import { dollarFormatter } from "util/Util";

type Row = {
    category: string;
    subcategory: string;
    consumption: number;
    emissions: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink",
};

const columns = [
    {
        name: "Resource Type",
        key: "category",
        colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
        ...cellClasses,
    },
    {
        name: "Subcategory",
        key: "subcategory",
        ...cellClasses,
    },
    {
        name: "Consumption",
        key: "consumption",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.consumption ?? 0)}</p>
        ),
        ...cellClasses,
    },
    {
        name: "Emissions",
        key: "emissions",
        renderCell: ({ row }: { row: Row }) => (
            <p className={"text-right"}>{dollarFormatter.format(row.emissions ?? 0)}</p>
        ),
        ...cellClasses,
    },
];

const [useRows] = bind(
    ResultModel.selectedMeasure$.pipe(
        map((measure) => {
            const consumption = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy",
            ].map((fuelType) => measure.totalTagFlows[fuelType]);

            const emissions = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy",
            ].map((fuelType) => measure.totalTagFlows[fuelType]);

            return [
                {
                    category: "Consumption",
                    subcategory: FuelType.ELECTRICITY,
                    consumption: consumption[0],
                    emissions: emissions[0],
                },
                { subcategory: FuelType.NATURAL_GAS, consumption: consumption[1], emissions: emissions[1] },
                { subcategory: FuelType.DISTILLATE_OIL, consumption: consumption[2], emissions: emissions[2] },
                { subcategory: FuelType.RESIDUAL_OIL, consumption: consumption[3], emissions: emissions[3] },
                { subcategory: FuelType.PROPANE, consumption: consumption[4], emissions: emissions[4] },
                { subcategory: "Total", consumption: consumption[5], emissions: emissions[5] },
                { category: "Water", subcategory: "Use" },
            ];
        }),
    ),
    [],
);

export default function ResourceUsage() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"h-full"}
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
            />
        </div>
    );
}
