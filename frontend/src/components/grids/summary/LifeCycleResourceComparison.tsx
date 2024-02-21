import DataGrid, { Column } from "react-data-grid";
import { bind } from "@react-rxjs/core";
import { alternatives$ } from "../../../model/Model";
import { map } from "rxjs/operators";
import { FuelType } from "../../../blcc-format/Format";

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

type CategoryAndSubcategory = {
    category?: string;
    subcategory: string;
};

const categoriesAndSubcategories: CategoryAndSubcategory[] = [
    { category: "Consumption", subcategory: FuelType.ELECTRICITY },
    { subcategory: FuelType.NATURAL_GAS },
    { subcategory: FuelType.DISTILLATE_OIL },
    { subcategory: FuelType.RESIDUAL_OIL },
    { subcategory: FuelType.PROPANE },
    { subcategory: "Total" },
    { category: "Emissions", subcategory: FuelType.ELECTRICITY },
    { subcategory: FuelType.NATURAL_GAS },
    { subcategory: FuelType.DISTILLATE_OIL },
    { subcategory: FuelType.RESIDUAL_OIL },
    { subcategory: FuelType.PROPANE },
    { subcategory: "Total" },
    { category: "Water", subcategory: "Use" }
];

export default function LifeCycleResourceComparison() {
    return (
        <div className={"w-full overflow-hidden rounded border shadow-lg"}>
            <DataGrid
                className={"h-fit"}
                rows={categoriesAndSubcategories}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                columns={useColumns()}
                style={{
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551"
                }}
                rowClass={(_row: Row, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                rowGetter={categoriesAndSubcategories}
                rowsCount={categoriesAndSubcategories.length}
            />
        </div>
    );
}
