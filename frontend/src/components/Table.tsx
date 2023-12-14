import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Form, Input, Table, TablePaginationConfig, Typography } from "antd";
import React, { PropsWithChildren, useState } from "react";
import { Observable } from "rxjs";

type Column<T> = {
    title: string;
    dataIndex: string;
    key?: string;
    editable?: boolean;
    fixed?: boolean;
    render?: (_: unknown, record: T) => JSX.Element;
};

export type TableProps<T> = {
    className?: string;
    columns: Column<T>[];
    editable: boolean;
    scroll?: { x?: number | string; y?: number | string };
    pagination?: false | TablePaginationConfig;
};

export type Table<T> = {
    changedData$: Observable<T[]>;
    component: React.FC<PropsWithChildren & TableProps<T>>;
};

interface EditableCellProps<T> extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    record: T;
    index: number;
    children: React.ReactNode;
}

/**
 * Creates a table component.
 */
const table = <T extends { key: string }>(tableData$: Observable<T[]>): Table<T> => {
    // use bind
    const [useTableData] = bind(tableData$, []);
    const [changedData$, changedData] = createSignal<T[]>();

    return {
        changedData$,
        component: ({
            className,
            editable = false,
            scroll,
            pagination = false,
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
        }: PropsWithChildren & TableProps<T>) => {
            const [form] = Form.useForm();
            const [editingKey, setEditingKey] = useState("");
            const isEditing = (recordKey: string) => recordKey === editingKey;

            const tableData = useTableData();

            const EditableCell: React.FC<EditableCellProps<T>> = ({
                editing,
                dataIndex,
                title,
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
                                        message: `Please input ${title}!`
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

            const edit = (record: T) => {
                const row: T | undefined = tableData.find((item: T) => item.key === record.key);
                form.setFieldsValue(row);
                setEditingKey(record.key);
            };

            const cancel = () => {
                setEditingKey("");
            };

            const save = async (key: string) => {
                try {
                    const row = (await form.validateFields()) as T;
                    // TODO: check if the row key is also being updated or implement a non-changing row key
                    const updatedData = tableData.map((item) => (item.key === key ? { ...item, ...row } : item));
                    changedData(updatedData);
                    setEditingKey("");
                } catch (errInfo) {
                    console.log("Validate Failed:", errInfo);
                }
            };

            const operation = [
                {
                    title: "operation",
                    dataIndex: "operation",
                    render: (_: unknown, record: T) => {
                        const editable = isEditing(record.key);
                        return editable ? (
                            <span>
                                <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                                    Save
                                </Typography.Link>
                                <Typography.Link onClick={cancel} style={{ marginRight: 8 }}>
                                    Cancel
                                </Typography.Link>
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
            if (editable) {
                columns.forEach((col) => {
                    col.editable = true;
                });

                columns = [...columns, ...operation];
            } else {
                columns.forEach((col) => {
                    col.editable = false;
                });
            }

            const mergedColumns = columns.map((col) => {
                if (!col.editable) {
                    return col;
                }
                return {
                    ...col,
                    onCell: (record: T) => ({
                        record,
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: isEditing(record.key),
                        fixed: col.fixed
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
                        columns={mergedColumns}
                        dataSource={useTableData()}
                        scroll={scroll}
                        pagination={pagination}
                    />
                </Form>
            );
        }
    };
};

export default table;
