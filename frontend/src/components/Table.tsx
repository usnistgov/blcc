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
    userData;
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

    // for this function to work:
    // 1. Get the most recent data from stream
    // 2. Based on the edit action clicked by the user, fetch the data for that specific row & make the row editable
    // 3. Once user is done editing, replace this specific row's data with the new changed data, keeping the remaining data unchanged
    // 4. Send the new data to the stream

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
            const isEditing = (record: userData) => record.key === editingKey;

            const edit = (record: Partial<userData> & { key: React.Key }) => {
                form.setFieldsValue({ ...record });
                console.log(record);
                setEditingKey(record.key);
            };

            const cancel = () => {
                setEditingKey("");
            };

            const save = async (key: React.Key) => {
                try {
                    const row = (await form.validateFields()) as userData;
                    console.log(row);
                    // const index = useTableData().findIndex((item) => key === item.key);
                    // if (index > -1) {
                    //     const item = tableData$[index];
                    //     const newData = [...tableData$];
                    //     newData.splice(index, 1, {
                    //         ...item,
                    //         ...row
                    //     });
                    //     setEditingKey("");
                    // } else {
                    setEditingKey("");
                    // }
                    // doubt this
                    changedData({ key: row });
                } catch (errInfo) {
                    console.log("Validate Failed:", errInfo);
                }
            };

            const operation = [
                {
                    title: "operation",
                    dataIndex: "operation",
                    render: (_: any, record: userData) => {
                        const editable = isEditing(record);
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
            return (
                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: EditableCell
                            }
                        }}
                        className={(className ? className : "") + " px-2 w-44"}
                        columns={[...columns, ...operation]}
                        dataSource={useTableData()}
                    />
                </Form>
            );
        }
    };
};

export default table;
