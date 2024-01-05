import switchComp from "./Switch";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { startWith } from "rxjs/operators";
import numberInput from "./InputNumber";
import { Observable, of } from "rxjs";
import { Form, Input, InputRef, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import type { TableProps } from "antd/es/table/InternalTable";

export function phaseIn() {
    const [constantOrEscalation$, setConstantOrEscalation] = createSignal<boolean>();
    const [constantOrEscalation] = bind(constantOrEscalation$, true);

    const { onChange$: constantChange$, component: Switch } = switchComp(constantOrEscalation$.pipe(startWith(true)));
    const { component: ConstantInput } = numberInput();
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
        ])
    );

    return {
        constantChange$,
        component: function PhaseIn() {
            constantChange$.subscribe(setConstantOrEscalation);

            return (
                <div>
                    <div>Constant</div>
                    <Switch checkedChildren={<>{"Yes"}</>} unCheckedChildren={<>{"No"}</>} />
                    {(constantOrEscalation() && <ConstantInput after={"%"} controls />) || (
                        <PhaseInTable size={"small"} />
                    )}
                </div>
            );
        }
    };
}

type DataType = {
    one: number;
    two: number;
};

type Change = [number, keyof DataType, DataType[keyof DataType]];

function createTable(data$: Observable<DataType[]>) {
    const [change$, change] = createSignal<Change>();

    const columns: (ColumnsType<DataType>[number] & { editable?: boolean })[] = [
        {
            title: "One",
            dataIndex: "one",
            editable: true,
            onCell: (record: DataType) => ({ record, editable: true, dataIndex: "one" })
        },
        {
            title: "Two",
            dataIndex: "two"
        }
    ];

    const [useData] = bind(data$, []);

    type EditableCellProps = {
        title: React.ReactNode;
        editable: boolean;
        dataIndex: keyof DataType;
        record: DataType;
    };

    let EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>>;
    EditableCell = ({ title, editable, children, dataIndex, record, ...rest }) => {
        console.log(dataIndex);
        console.log(record);
        console.log("-----");

        const [editing, setEditing] = useState(false);
        const inputRef = useRef<InputRef>(null);

        useEffect(() => {
            if (editing) inputRef.current!.focus();
        }, [editing]);

        const save = () => {};

        const editComponent = editing ? (
            <Form.Item>
                <Input
                    ref={inputRef}
                    value={record !== undefined ? record[dataIndex] : ""}
                    onBlur={() => setEditing(false)}
                    onPressEnter={() => setEditing(false)}
                />
            </Form.Item>
        ) : (
            <div className={"hover:border-2"} onClick={() => setEditing(!editing)}>
                {children}
            </div>
        );

        return <td {...rest}>{(editable && editComponent) || children}</td>;
    };

    return {
        component: ({ ...tableProps }: TableProps<DataType>) => (
            <Table
                components={{
                    body: {
                        cell: EditableCell
                    }
                }}
                columns={columns}
                dataSource={useData()}
                {...tableProps}
            />
        )
    };
}
