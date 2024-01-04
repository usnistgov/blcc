import switchComp from "./Switch";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { startWith } from "rxjs/operators";
import numberInput from "./InputNumber";
import { Observable, of } from "rxjs";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

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
                    {(constantOrEscalation() && <ConstantInput after={"%"} controls />) || <PhaseInTable />}
                </div>
            );
        }
    };
}

type DataType = {
    one: number;
    two: number;
};

function createTable(data$: Observable<DataType[]>) {
    const columns: (ColumnsType<DataType>[number] & { editable?: boolean })[] = [
        {
            title: "One",
            dataIndex: "one",
            editable: true,
            onCell: (record: DataType) => {}
        },
        {
            title: "Two",
            dataIndex: "two"
        }
    ];

    const [useData] = bind(data$, []);

    return {
        component: () => <Table columns={columns} dataSource={useData()} size={"small"} />
    };
}
