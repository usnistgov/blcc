import DataGrid, { Column } from "react-data-grid";
import { bind } from "@react-rxjs/core";
import { alternatives$ } from "../../../model/Model";
import { map } from "rxjs/operators";
import { FuelType } from "../../../blcc-format/Format";
import { measures$ } from "../../../model/ResultModel";
import { dollarFormatter, getOptionalTag } from "../../../util/Util";

type Row = {
    category: string;
    subcategory: string;
} & {
    [key: string]: number;
};

const cellClasses = {
    headerCellClass: "bg-primary text-white",
    cellClass: "text-ink"
};

const [useColumns] = bind(
    alternatives$.pipe(
        map((alternatives) => {
            const cols = alternatives.map(
                (alternative, i) =>
                    ({
                        name: alternative.name,
                        key: i.toString(),
                        renderCell: ({ row }: { row: { [x: string]: number | bigint } }) => (
                            <p className={"text-right"}>{dollarFormatter.format(row[i.toString()] ?? 0)}</p>
                        ),
                        ...cellClasses
                    }) as Column<Row>
            );

            cols.unshift(
                {
                    name: "Resource Type",
                    key: "category",
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
                    ...cellClasses
                },
                {
                    name: "Subcategory",
                    key: "subcategory",
                    ...cellClasses
                }
            );

            return cols;
        })
    ),
    []
);

const [useRows] = bind(
    measures$.pipe(
        map((measures) => {
            const consumption = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy"
            ].map((fuelType) => getOptionalTag(measures, fuelType));

            return [
                { category: "Consumption", subcategory: FuelType.ELECTRICITY, ...consumption[0] },
                { subcategory: FuelType.NATURAL_GAS, ...consumption[1] },
                { subcategory: FuelType.DISTILLATE_OIL, ...consumption[2] },
                { subcategory: FuelType.RESIDUAL_OIL, ...consumption[3] },
                { subcategory: FuelType.PROPANE, ...consumption[4] },
                { subcategory: "Total", ...consumption[5] },
                { category: "Emissions", subcategory: FuelType.ELECTRICITY },
                { subcategory: FuelType.NATURAL_GAS },
                { subcategory: FuelType.DISTILLATE_OIL },
                { subcategory: FuelType.RESIDUAL_OIL },
                { subcategory: FuelType.PROPANE },
                { subcategory: "Total" },
                { category: "Water", subcategory: "Use" }
            ];
        })
    ),
    []
);

export default function LifeCycleResourceComparison() {
    const rows = useRows();

    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                rows={rows}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                columns={useColumns()}
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
