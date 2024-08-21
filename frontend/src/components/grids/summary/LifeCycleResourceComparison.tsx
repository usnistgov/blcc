import { bind } from "@react-rxjs/core";
import { FuelType } from "blcc-format/Format";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import DataGrid, { type Column } from "react-data-grid";
import { map } from "rxjs/operators";
import { dollarFormatter, getOptionalTag, numberFormatter } from "util/Util";

type Row = {
    category: string;
    subcategory: string;
} & {
    [key: string]: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink",
};

const [useColumns] = bind(
    alternatives$.pipe(
        map((alternatives) => {
            const cols = alternatives.map(
                (alternative, i) =>
                    ({
                        name: alternative.name,
                        key: i.toString(),
                        renderCell: ({ row, rowIdx }: { row: Row; rowIdx: number }) => {
                            const formatter = rowIdx > 5 ? numberFormatter : dollarFormatter;
                            return (
                                <p className={"text-right"}>
                                    {formatter.format(row[i.toString()] ?? 0)} {rowIdx > 5 && "kg co2"}
                                </p>
                            );
                        },
                        ...cellClasses,
                    }) as Column<Row>,
            );

            cols.unshift(
                {
                    name: "Resource Type",
                    key: "category",
                    // @ts-ignore
                    colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
                    ...cellClasses,
                },
                {
                    name: "Subcategory",
                    key: "subcategory",
                    ...cellClasses,
                },
            );

            return cols;
        }),
    ),
    [],
);

const [useRows] = bind(
    ResultModel.measures$.pipe(
        map((measures) => {
            const consumption = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy",
            ].map((fuelType) => getOptionalTag(measures, fuelType));

            const emissions = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Emissions",
            ].map((fuelType) => getOptionalTag(measures, `${fuelType} Emissions`));

            return [
                { category: "Consumption", subcategory: FuelType.ELECTRICITY, ...consumption[0] },
                { subcategory: FuelType.NATURAL_GAS, ...consumption[1] },
                { subcategory: FuelType.DISTILLATE_OIL, ...consumption[2] },
                { subcategory: FuelType.RESIDUAL_OIL, ...consumption[3] },
                { subcategory: FuelType.PROPANE, ...consumption[4] },
                { subcategory: "Total", ...consumption[5] },
                { category: "Emissions", subcategory: FuelType.ELECTRICITY, ...emissions[0] },
                { subcategory: FuelType.NATURAL_GAS, ...emissions[1] },
                { subcategory: FuelType.DISTILLATE_OIL, ...emissions[2] },
                { subcategory: FuelType.RESIDUAL_OIL, ...emissions[3] },
                { subcategory: FuelType.PROPANE, ...emissions[4] },
                { subcategory: "Total", ...emissions[5] },
                { category: "Water", subcategory: "Use" }, //TODO: Add in water usage category
            ];
        }),
    ),
    [],
);

export default function LifeCycleResourceComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                // @ts-ignore
                rows={rows}
                columns={useColumns()}
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
