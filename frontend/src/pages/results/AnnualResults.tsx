import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { json } from "../../../../docs/FederalFinancedE3Result";
import dropdown from "../../components/Dropdown";
import table from "../../components/Table";
import { roundTo2Decimals } from "../../util/Util";

const data$ = of(json);

const { Title } = Typography;

const alts = ["Alt 1", "Alt 2", "Alt 3"];

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
                fixed: false
            };
        });
        cols.unshift({
            title: "Year",
            dataIndex: "year",
            key: "year",
            editable: false,
            fixed: true
        });
        return cols;
    })
);

const resultsAlternatives$ = required$.pipe(map((alts) => alts.map((alt) => alt.altId)));

const [useResultsAlternatives] = bind(resultsAlternatives$, []);
const [useResultsColumns] = bind(resultsCols$, []);

const cashFlow$ = required$.pipe(map((r) => r.map((a) => a.totalCostsDiscounted)));
const cashFlowData$ = cashFlow$.pipe(
    map((cash) => {
        const cols = [];
        for (let i = 0; i < cash?.[0]?.length; i++) {
            const subCols = [];
            subCols.push(i);
            for (let j = 0; j < cash.length; j++) {
                subCols.push(roundTo2Decimals(cash[j][i]));
            }
            cols.push(subCols);
        }
        const columnData = cols.map((arr) => {
            const key = arr[0];
            const year = arr[0];
            const values = arr.slice(1);
            return { key, year, ...values };
        });
        return columnData;
    })
);

const { change$: AlternativeChange$, component: AlternativeDropdown } = dropdown(Object.values(alts));
const { component: NPVComparisonTable } = table(cashFlowData$);

export default function AnnualResults() {
    const data = useData();
    console.log(data);

    return (
        <div className={"w-full h-full p-5 "}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>NPV Cash Flow Comparison</Title>
                    <Divider />
                    <NPVComparisonTable editable={false} columns={useResultsColumns()} scroll={{ x: 300, y: 350 }} />
                </div>
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
