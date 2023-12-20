import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { json } from "../../../../docs/FederalFinancedE3Result";
import dropdown from "../../components/Dropdown";
import table from "../../components/Table";
import { dollarFormatter } from "../../util/Util";

const data$ = of(json);

const { Title } = Typography;

const [useData] = bind(data$, {
    optional: [],
    measure: [],
    required: []
});

const required$ = data$.pipe(map((datas) => datas?.required));
const resultsCols$ = required$.pipe(
    map((alts) => {
        const cols = alts.map((alt) => {
            return {
                title: ` Alt #${alt?.altId.toString()}`,
                dataIndex: alt?.altId.toString(),
                key: alt?.altId.toString(),
                editable: false,
                fixed: false,
                align: "right",
                width: "default"
            };
        });
        cols.unshift({
            title: "Year",
            dataIndex: "year",
            key: "year",
            editable: false,
            fixed: true,
            width: "100px",
            align: "left"
        });
        return cols;
    })
);

const resultsAlternatives$ = required$.pipe(map((alts) => alts.map((alt) => alt.altId)));

export const [useResultsAlternatives] = bind(resultsAlternatives$, []);
const [useResultsColumns] = bind(resultsCols$, []);

const cashFlow$ = required$.pipe(map((r) => r.map((a) => a.totalCostsDiscounted)));
const cashFlowData$ = cashFlow$.pipe(
    map((cash) => {
        const cols = [];
        for (let i = 0; i < cash?.[0]?.length; i++) {
            const subCols = [];
            subCols.push(i);
            for (let j = 0; j < cash.length; j++) {
                subCols.push(dollarFormatter.format(cash[j][i]));
            }
            cols.push(subCols);
        }
        const columnData = cols.map((arr) => {
            const key = arr[0].toString();
            const year = arr[0];
            const values = arr.slice(1);
            return { key, year, ...values };
        });
        return columnData;
    })
);

const { change$: AlternativeChange$, component: AlternativeDropdown } = dropdown(resultsAlternatives$);
const { component: NPVComparisonTable } = table(cashFlowData$);

export default function AnnualResults() {
    const data = useData();
    console.log(data);

    return (
        <div className={"w-full h-full p-5 "}>
            <div className="grid grid-cols-2 gap-4">
                <NPVComparisonTable
                    editable={false}
                    columns={useResultsColumns()}
                    scroll={{ x: 300, y: 350 }}
                    title="NPV Cash Flow Comparison"
                />
                <div>
                    <Title level={5}>NPV Cash Flows</Title>
                    <Divider />
                </div>
            </div>
            <br />
            <div>
                <AlternativeDropdown className={"w-1/4"} label="Annual Results for Alternative" />
            </div>
            <br />
            <Title level={5}>NPV Cash Flow by Alternative</Title>
            <Divider />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>NPV Cash Flows</Title>
                    <Divider />
                </div>
                <div>
                    <Title level={5}>Tag/Object by Year</Title>
                    <Divider />
                </div>
            </div>
        </div>
    );
}
