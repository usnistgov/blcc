import Title from "antd/es/typography/Title"
import switchComp from "./Switch";
import { type Observable, of } from "rxjs";
import DataGrid, { type RenderEditCellProps, textEditor, type RenderCellProps } from "react-data-grid";
import { bind } from "@react-rxjs/core";
import { percentFormatter } from "../util/Util";
import numberInput from "./InputNumber";

export default function constantOrTable<T>(values$: Observable<T[]>, isConstant$: Observable<boolean>) {
    const { component: ConstantSwitch, onChange$: switchChange$ } = switchComp(of(false));
    const { component: ConstantInput } = numberInput();

    const [useValues] = bind(values$, []);
    const [isConstant] = bind(isConstant$, true);

    return {
        component: function ConstantOrTable() {
            return <>
                <Title level={5}>Escalation Rates</Title>
                <span className={"flex flex-row items-center gap-2 pb-2"}>
                    <p className={"text-md pb-1"}>Constant</p>
                    <ConstantSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                </span>


                {isConstant() && <div className={"w-full overflow-hidden rounded shadow-lg"}>
                    <DataGrid
                        className={"h-full"}
                        rows={useValues()}
                        columns={[
                            {
                                name: "Year",
                                key: "year"
                            },
                            {
                                name: "Escalation Rate (%)",
                                key: "escalationRate",
                                renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<T, unknown>) => {
                                    return <input
                                        className={"w-full pl-4"}
                                        type={"number"}
                                        defaultValue={row.escalationRate * 100}
                                        onChange={(event) => onRowChange({
                                            ...row,
                                            [column.key]: Number.parseFloat(event.currentTarget.value) / 100
                                        })}
                                    />
                                },
                                editable: true,
                                renderCell: (info: RenderCellProps<EscalationRateInfo, unknown>) => {
                                    return percentFormatter.format(info.row.escalationRate);
                                }
                            }
                        ]}
                        onRowsChange={newRates}
                    />
                </div>}
            </>
        }
    }
}
