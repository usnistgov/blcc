import Title from "antd/es/typography/Title"
import switchComp from "./Switch";
import { type Observable, of } from "rxjs";
import DataGrid, { type RenderEditCellProps, type RenderCellProps } from "react-data-grid";
import { bind } from "@react-rxjs/core";
import numberInput from "./InputNumber";
import type { ReactNode } from "react";
import { createSignal } from "@react-rxjs/utils";

export type RateInfo<T> = {
    year: number;
    value: T;
};

export type ConstantOrTableProps = {
    title: string;
    tableHeader: string;
    key: string;
};

export default function constantOrTable<A>(
    values$: Observable<A[]>,
    isConstant$: Observable<boolean>,
    renderEditCell: (props: RenderEditCellProps<A, unknown>) => ReactNode,
    renderCell: (props: RenderCellProps<A, unknown>) => ReactNode
) {
    const { component: ConstantSwitch, onChange$: switchChange$ } = switchComp(isConstant$);
    const { component: ConstantInput } = numberInput("", "");

    const [rowChange$, changeRows] = createSignal<A[]>();
    const [useValues] = bind(values$, []);
    const [isConstant] = bind(isConstant$, true);

    return {
        onChange$: rowChange$,
        toggleConstant$: switchChange$,
        component: function ConstantOrTable({
            title,
            tableHeader,
            key
        }: ConstantOrTableProps) {
            const values = useValues();

            return <div>
                <Title level={5}>{title}</Title>
                <span className={"flex flex-row items-center gap-2 pb-2"}>
                    <p className={"text-md pb-1"}>Constant</p>
                    <ConstantSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                </span>


                {isConstant() &&
                    <ConstantInput className={"w-1/2"} /> ||
                    <div className={"w-full overflow-hidden rounded shadow-lg"}>
                        <DataGrid
                            className={"h-full"}
                            rows={values}
                            columns={[
                                {
                                    name: "Year",
                                    key: "year"
                                },
                                {
                                    name: tableHeader,
                                    key,
                                    renderEditCell,
                                    editable: true,
                                    renderCell
                                }
                            ]}
                            onRowsChange={changeRows}
                        />
                    </div>}
            </div>
        }
    }
}
