import { Observable } from "rxjs";
import React, { PropsWithChildren, useState } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Form, Input, Popconfirm, Table, Typography } from "antd";

type Column = {
    title: string;
    dataIndex: string;
    key?: string;
    editable?: boolean;
    render?: JSX.Element;
};

// the data passed on to the table can be anything depending on the use case
type data = any;

export type TableProps = {
    className?: string;
    columns: Column[];
    data;
};

export type Table = {
    tableData$: Observable<any>;
    component: React.FC<PropsWithChildren & TableProps>;
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    record: data;
    index: number;
    children: React.ReactNode;
}

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

/**
 * Creates a table component.
 */
export default function table(): Table {
    const [form] = Form.useForm();
    const [tableData$, tableData] = createSignal<any[]>([]);
    const [editingKey, setEditingKey] = useState("");

    const isEditing = (record: data) => record.key === editingKey;

    const edit = (record: Partial<data> & { key: React.Key }) => {
        form.setFieldsValue({ ...record });
        console.log(record);
        // setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey("");
    };

    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as data;

            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                setEditingKey("");
            } else {
                newData.push(row);
                setEditingKey("");
            }
            tableData(newData);
        } catch (errInfo) {
            console.log("Validate Failed:", errInfo);
        }
    };

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
                },
                {
                    title: "operation",
                    dataIndex: "operation",
                    render: (_: any, record: data) => {
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
            ],
            data = []
        }: PropsWithChildren & TableProps) => {
            return (
                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: EditableCell
                            }
                        }}
                        className={(className ? className : "") + " px-2 w-44"}
                        columns={columns}
                        dataSource={data}
                    />
                </Form>
            );
        }
    };
}
