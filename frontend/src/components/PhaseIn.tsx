import switchComp from "./Switch";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { startWith } from "rxjs/operators";
import numberInput from "./InputNumber";
import { type Observable, of } from "rxjs";
import { Form, type FormInstance, Input, type InputRef, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useContext, useEffect, useRef, useState } from "react";
import type { TableProps } from "antd/es/table/InternalTable";

export function phaseIn() {
    const [constantOrEscalation$, setConstantOrEscalation] = createSignal<boolean>();
    const [constantOrEscalation] = bind(constantOrEscalation$, true);

    const { onChange$: constantChange$, component: Switch } = switchComp(constantOrEscalation$.pipe(startWith(true)));
    const { component: ConstantInput } = numberInput("Value", "");
    const { component: PhaseInTable } = createTable(
        of([
            {
                one: 100,
                two: 50
            },
            {
                one: 10,
                two: 4
            }
        ]),
        [
            {
                title: "Year",
                dataIndex: "one"
            },
            {
                title: "Usage Index",
                dataIndex: "two",
                editable: true
            }
        ]
    );

    return {
        constantChange$,
        component: function PhaseIn() {
            constantChange$.subscribe(setConstantOrEscalation);

            return (
                <div className={"flex w-full flex-col"}>
                    <div className={"my-2"}>Constant</div>
                    <Switch className={"mb-4 w-fit"} checkedChildren={"Yes"} unCheckedChildren={"No"} />
                    {(constantOrEscalation() && <ConstantInput addonAfter={"%"} controls />) || (
                        <PhaseInTable size={"small"} />
                    )}
                </div>
            );
        }
    };
}

const EditableContext = React.createContext<FormInstance | null>(null);

function createTable<T extends object>(
    data$: Observable<T[]>,
    columns: (ColumnsType<T>[number] & { editable?: boolean })[]
) {
    type Change = [number, keyof T, T[keyof T]];
    const [change$, change] = createSignal<Change>();

    change$.subscribe(console.log);

    const [useData] = bind(data$, []);

    type EditableCellProps = {
        title: React.ReactNode;
        editable: boolean;
        dataIndex: keyof T;
        rowIndex: number;
        record: T;
    };

    type EditableRowProps = {
        index: number;
    };

    const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        console.log(index);

        const [form] = Form.useForm();
        return (
            <Form form={form} component={false}>
                <EditableContext.Provider value={form}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };

    const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        rowIndex,
        ...rest
    }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef<InputRef>(null);
        const form = useContext(EditableContext)!;

        useEffect(() => {
            if (editing) inputRef.current!.focus();
        }, [editing]);

        const startEditing = () => {
            setEditing(!editing);
            form.setFieldsValue({ dataIndex: record[dataIndex] });
        };

        const save = async () => {
            const data = await form.validateFields();
            change([rowIndex, dataIndex, data[dataIndex]]);
            setEditing(false);
        };

        const editComponent = editing ? (
            <Form.Item
                name={dataIndex.toString()}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`
                    }
                ]}
            >
                <Input
                    ref={inputRef}
                    value={(record === undefined ? "" : record[dataIndex]) as string | number}
                    onBlur={save}
                    onPressEnter={save}
                />
            </Form.Item>
        ) : (
            <div className={"hover:border-2"} onClick={startEditing}>
                {children}
            </div>
        );

        return <td {...rest}>{(editable && editComponent) || children}</td>;
    };

    const editableColumns: ColumnsType<T> = columns.map((column) => {
        if (!column.editable) return column as ColumnsType<T>[number];

        return {
            ...column,
            onCell: (record: T, rowIndex: number) => ({ record, editable: true, dataIndex: "one", rowIndex })
        } as ColumnsType<T>[number];
    });

    return {
        change$,
        component: ({ ...tableProps }: Omit<TableProps<T>, "components" | "columns" | "dataSource">) => (
            <Table
                components={{
                    body: {
                        row: EditableRow,
                        cell: EditableCell
                    }
                }}
                columns={editableColumns}
                dataSource={useData()}
                {...tableProps}
            />
        )
    };
}
