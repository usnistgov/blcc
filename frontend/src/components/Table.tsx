import { Observable } from "rxjs";
import React, { PropsWithChildren, useState } from "react";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { Form, Input, Popconfirm, Table, Typography } from "antd";

type Column = {
    title: string;
    dataIndex: string;
    key?: string;
    editable?: boolean;
    render?: (_: any, record: userData) => JSX.Element;
};

// the data passed on to the table can be anything depending on the use case
type userData = any;

export type TableProps = {
    className?: string;
    columns: Column[];
};

export type Table = {
    tableData$: Observable<any[]>;
    component: React.FC<PropsWithChildren & TableProps>;
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    record: userData;
    index: number;
    children: React.ReactNode;
}

/**
 * Creates a table component.
 */
const table = (tableData$: userData): Table => {
    // use bind
    const [useTableData] = bind(tableData$, []);
    const [changedData$, changedData] = createSignal<any>();

    return {
        tableData$,
        component: ({
            className,
            columns = [
                {
                    title: "Column 1",
                    dataIndex: "column1",
                    key: "column1",
                    editable: true
                },
                {
                    title: "Column 2",
                    dataIndex: "column2",
                    key: "column2",
                    editable: true
                }
            ]
        }: PropsWithChildren & TableProps) => {
            const [form] = Form.useForm();
            const [editingKey, setEditingKey] = useState("");
            // const isEditing = (record: userData) => record.key === editingKey;
            const isEditing = (recordKey: userData) => recordKey === editingKey;

            const tableData = useTableData();

            const EditableCell: React.FC<EditableCellProps> = ({
                editing,
                dataIndex,
                title,
                // record,
                // index,
                children,
                ...restProps
            }) => {
                return (
                    <td {...restProps}>
                        {editing ? (
                            <Form.Item
                                name={dataIndex}
                                style={{ margin: 0 }}
                                rules={[
                                    {
                                        required: true,
                                        message: `Please Input ${title}!`
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        ) : (
                            children
                        )}
                    </td>
                );
            };

            const edit = (record: userData) => {
                const row: userData = tableData.find((item: userData) => item.key === record.key);
                form.setFieldsValue(row);
                setEditingKey(record.key);
            };

            const cancel = () => {
                setEditingKey("");
            };

            const save = async (key: string) => {
                try {
                    const row = (await form.validateFields()) as userData;
                    console.log("row", row);
                    const updatedData = tableData$.map((item: userData) =>
                        item.key === key ? { ...item, ...row } : item
                    );
                    tableData$.next(updatedData);
                    setEditingKey("");
                    // doubt this
                    // changedData({ key: row });
                } catch (errInfo) {
                    console.log("Validate Failed:", errInfo);
                }
            };

            const operation = [
                {
                    title: "operation",
                    dataIndex: "operation",
                    render: (_: any, record: userData) => {
                        const editable = isEditing(record.key);
                        return editable ? (
                            <span>
                                <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                                    Save
                                </Typography.Link>
                                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                                    <a>Cancel</a>
                                </Popconfirm>
                            </span>
                        ) : (
                            <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
                                Edit
                            </Typography.Link>
                        );
                    }
                }
            ];

            // logic to make all columns editable by default
            columns.forEach((col) => {
                col.editable = true;
            });

            columns = [...columns, ...operation];

            const mergedColumns = columns.map((col) => {
                if (!col.editable) {
                    return col;
                }
                return {
                    ...col,
                    onCell: (record: userData) => ({
                        record,
                        // inputtype: col.dataIndex === "text",
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: isEditing(record.key)
                    })
                };
            });

            return (
                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: EditableCell
                            }
                        }}
                        className={(className ? className : "") + " px-2"}
                        // columns={[...columns, ...operation]}
                        columns={mergedColumns}
                        dataSource={useTableData()}
                    />
                </Form>
            );
        }
    };
};

export default table;
