import DataGrid, { Column } from "react-data-grid";
import { map } from "rxjs/operators";
import { alternatives$ } from "../../../model/Model";
import { bind } from "@react-rxjs/core";

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
                    name: "Cost Type",
                    key: "category",
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    colSpan: ({ type }: { type: string }) => (type === "HEADER" ? 2 : undefined),
                    ...cellClasses
                },
                {
                    name: "subcategory",
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
    subcategory?: string;
};

const categoriesAndSubcategories: CategoryAndSubcategory[] = [
    { category: "Investment" },
    { category: "Energy", subcategory: "Consumption" },
    { subcategory: "Demand" },
    { subcategory: "Rebates" },
    { category: "Water", subcategory: "Usage" },
    { subcategory: "Disposal " },
    { category: "OMR", subcategory: "Recurring" },
    { subcategory: "Non-Recurring" },
    { category: "Replacement" },
    { category: "Residual Value" }
];

export default function NpvCostsBySubcategory() {
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
