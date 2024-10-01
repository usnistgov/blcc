import DataGrid, { RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { percentFormatter, toDecimal, toPercentage } from "util/Util";
import { Divider } from "antd";
import React from "react";

type PhaseInRateInfo = {
    year: number;
    phaseIn: number;
};
const COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Phase In (%)",
        key: "phaseIn",
        renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<PhaseInRateInfo>) => {
            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={toPercentage(row.phaseIn)}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: toDecimal(event.currentTarget.value),
                        })
                    }
                />
            );
        },
        editable: true,
        renderCell: (info: RenderCellProps<PhaseInRateInfo>) => {
            return percentFormatter.format(info.row.phaseIn);
        },
    },
];

export default function PhaseIn() {
    const rates: PhaseInRateInfo[] = [];

    return (
        <div className={"grid grid-cols-2"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Cost-Phasing of Initial Cost
            </Divider>
            <div className={"w-full overflow-hidden rounded shadow-lg"}>
                <DataGrid className={"h-full rdg-light"} rows={rates} columns={COLUMNS} />
            </div>
        </div>
    );
}
