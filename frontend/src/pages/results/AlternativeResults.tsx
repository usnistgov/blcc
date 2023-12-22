import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { combineLatest, of } from "rxjs";
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

type colsType = {
    title: string;
    dataIndex: string;
    key: string;
    editable: boolean;
    fixed: boolean;
    align?: string;
    width?: string;
};

const resultsAlternatives$ = required$.pipe(map((alts) => alts.map((alt) => alt.altId)));
const { change$: AlternativeChange$, component: AlternativeDropdown } = dropdown(resultsAlternatives$);

const resultsCols$ = AlternativeChange$.pipe(
    map((alts) => {
        const cols: colsType[] = [
            {
                title: "Year",
                dataIndex: "year",
                key: "year",
                editable: false,
                fixed: true,
                width: "75px"
            },
            {
                title: ` Alt #${alts.toString()}`,
                dataIndex: alts.toString(),
                key: alts.toString(),
                editable: false,
                fixed: false,
                align: "right"
            }
        ];
        return cols;
    })
);

const [useResultsAlternatives] = bind(resultsAlternatives$, []);
const [useResultsColumns] = bind(resultsCols$, []);

const cashFlow$ = required$.pipe(map((r) => r.map((a) => a.totalCostsDiscounted)));
// const NPV$ = cashFlow$.pipe(
//     map((cash) => {
//         const cols = [];
//         for (let i = 0; i < cash?.[0]?.length; i++) {
//             const subCols = [];
//             subCols.push(i);
//             for (let j = 0; j < cash.length; j++) {
//                 subCols.push(dollarFormatter.format(cash[j][i]));
//             }
//             cols.push(subCols);
//         }
//         // console.log(cols);
//         const columnData = cols.map((arr) => {
//             const key = arr[0].toString();
//             const year = arr[0];
//             const values = arr.slice(1);
//             console.log(values, { key, year, ...values });
//             return { key, year, ...values };
//         });
//         return columnData;
//     })
// );

const NPVComparisonData$ = combineLatest([AlternativeChange$, cashFlow$]).pipe(
    map((cash) => {
        const alt = cash[0];
        const data = cash[1][alt];
        const cols = [];
        for (let i = 0; i < data.length; i++) {
            const subCols = [];
            subCols.push(i);
            for (let j = 0; j < cash.length - 1; j++) {
                subCols.push(dollarFormatter.format(data[i]));
            }
            cols.push(subCols);
        }
        const columnData = cols.map((arr) => {
            const obj: {
                key: string;
                year: string | number;
                alt: string;
                [index: number]: string | number;
            } = {
                key: "",
                year: "",
                alt: ""
            };
            obj["key"] = arr[0].toString();
            obj["year"] = arr[0];
            obj[alt] = arr[1];
            return obj;
        });
        return columnData;
    })
);

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

        columnData.unshift(
            { resources: "Energy", "sub-category": "Electricity" },
            { resources: "", "sub-category": "Natural Gas" },
            { resources: "", "sub-category": "Fuel Oil" },
            { resources: "", "sub-category": "Propane" },
            { resources: "", "sub-category": "Total" },
            { resources: "Water", "sub-category": "Use" }
        );

        return columnData;
    })
);

const { component: NPVComparisonTable } = table(NPVComparisonData$);
const { component: ResourcesTable } = table(cashFlowData$);

const resourcesTableColumns = [
    {
        title: "Resources",
        dataIndex: "resources",
        key: "resources",
        editable: false,
        fixed: false
    },
    {
        title: "",
        dataIndex: "sub-category",
        key: "sub-category",
        editable: false,
        fixed: true
    },
    {
        title: "Consumption",
        dataIndex: "consumption",
        key: "consumption",
        editable: false,
        fixed: false
    },
    {
        title: "Emissions",
        dataIndex: "emissions",
        key: "emissions",
        editable: false,
        fixed: false
    }
];

export default function AlternativeResults() {
    const data = useData();
    console.log(data);

    return (
        <div className={"w-full h-full p-5 "}>
            <div>
                <AlternativeDropdown className={"w-1/4"} label="Alternative Results" placeholder="Select Alternative" />
            </div>
            <br />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>NPV Cash Flow Comparison</Title>
                    <Divider />
                    <NPVComparisonTable
                        editable={false}
                        columns={useResultsColumns()}
                        scroll={{ x: 300, y: 350 }}
                        // this will fix itself when we merge
                        title="NPV Cash Flow Comparison"
                    />
                </div>
                <div>
                    <Title level={5}>Energy & Water Use, Emissions, & Social Cost of GHG</Title>
                    <Divider />
                    <ResourcesTable
                        editable={false}
                        columns={resourcesTableColumns}
                        scroll={{ x: 300, y: 350 }}
                        // this will fix itself when we merge
                        title="Energy & Water Use, Emissions, & Social Cost of GHG"
                    />
                </div>
            </div>
            <br />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>Share of LCC</Title>
                    <Divider />
                </div>
                <div>
                    <Title level={5}>Share of Energy Use</Title>
                    <Divider />
                </div>
            </div>
        </div>
    );
}
