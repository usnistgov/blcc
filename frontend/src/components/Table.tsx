import React, { PropsWithChildren } from "react";
import { Table } from "antd";

type Column = {
    title: string;
    dataIndex: string;
    key: string;
};

// the data passed on to the table can be anything depending on the use case
type data = any;

export type TableProps = {
    className?: string;
    columns: Column[];
    data;
};

export type Table = {
    component: React.FC<PropsWithChildren & TableProps>;
};

/**
 * Creates a table component.
 */
export default function table(): Table {
    return {
        component: ({
            className,
            columns = [
                {
                    title: "Column 1",
                    dataIndex: "column1",
                    key: "column1"
                },
                {
                    title: "Column 2",
                    dataIndex: "column2",
                    key: "column2"
                }
            ],
            data = []
        }: PropsWithChildren & TableProps) => {
            return (
                <Table className={(className ? className : "") + " px-2 w-44"} columns={columns} dataSource={data} />
            );
        }
    };
}
