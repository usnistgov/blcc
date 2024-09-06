import { state, useStateObservable } from "@react-rxjs/core";
import Title from "antd/es/typography/Title";
import type { Cost, CostTypes, FuelType } from "blcc-format/Format";
import { SubcategoryTable } from "pages/editor/alternative/SubcategoryTable";
import { type ReactNode, useMemo } from "react";
import type { Observable, Subject } from "rxjs";
import Info from "components/Info";

export type Subcategories<T> = {
    [key in keyof T]: Cost[];
};

type CategoryTableProps = {
    name: string;
    info: ReactNode;
    category$: Observable<Subcategories<FuelType | CostTypes>>;
    sAddCostModal$: Subject<CostTypes | FuelType>;
};

export default function CategoryTable({ name, info, category$, sAddCostModal$ }: CategoryTableProps) {
    const defaultedCategory$ = useMemo(() => state(category$, {} as Subcategories<FuelType | CostTypes>), [category$]);

    const children = useStateObservable(defaultedCategory$);

    return (
        <div className={"min-w-[20rem] max-w-xl"} key={name}>
            <div className={"flex justify-between"}>
                <Title level={5}>
                    <Info text={info}>{name}</Info>
                </Title>
            </div>

            <div className={"flex flex-col overflow-hidden rounded-md border border-base-lightest shadow-md"}>
                {Object.entries(children).map(([name, costs]) => (
                    <SubcategoryTable
                        key={name}
                        name={name}
                        costs={costs as unknown as Cost[]}
                        sAddCostModal$={sAddCostModal$}
                    />
                ))}
            </div>
        </div>
    );
}
