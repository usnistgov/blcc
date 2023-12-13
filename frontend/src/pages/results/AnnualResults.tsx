import { bind } from "@react-rxjs/core";
import { Divider, Typography } from "antd";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { json } from "../../../../docs/FederalFinancedE3Result";
import dropdown from "../../components/Dropdown";
import table from "../../components/Table";

const data$ = of(json);

const { Title } = Typography;

const alts = ["Alt 1", "Alt 2", "Alt 3"];

const { component: NPVComparisonTable } = table();
const { component: NPVByAltTable } = table();
const NPVByAltTableCols = [
    {
        title: "Year",
        dataIndex: "year",
        key: "year",
        editable: false
    },
    {
        title: "Investment",
        dataIndex: "investment",
        key: "investment",
        editable: false
    },
    {
        title: "Energy",
        dataIndex: "energy",
        key: "energy",
        editable: false,
        children: [
            { title: "Consumption", dataIndex: "consumption", key: "consumption", editable: false },
            { title: "Demands", dataIndex: "demands", key: "demands", editable: false },
            { title: "Rebates", dataIndex: "rebates", key: "rebates", editable: false }
        ]
    },
    {
        title: "Water",
        dataIndex: "water",
        key: "water",
        editable: false,
        children: [
            { title: "Use", dataIndex: "use", key: "use", editable: false },
            { title: "Disposal", dataIndex: "disposal", key: "disposal", editable: false }
        ]
    },
    {
        title: "OMR",
        dataIndex: "omr",
        key: "omr",
        editable: false,
        children: [
            { title: "Recurring", dataIndex: "recurring", key: "recurring", editable: false },
            { title: "Non-Recurring", dataIndex: "non-recurring", key: "non-recurring", editable: false }
        ]
    },
    {
        title: "Replace",
        dataIndex: "replace",
        key: "replace",
        editable: false
    },
    {
        title: "RV",
        dataIndex: "rv",
        key: "rv",
        editable: false
    },
    {
        title: "Total",
        dataIndex: "total",
        key: "total",
        editable: false
    }
];

const [useData] = bind(data$, {});

const required$ = data$.pipe(map((datas) => datas?.required));
const resultsCols$ = required$.pipe(
    map((alts) => {
        const cols = alts.map((alt) => {
            return {
                title: ` Alt #${alt?.altId.toString()}`,
                dataIndex: alt?.altId.toString(),
                key: alt?.altId.toString(),
                editable: false
            };
        });
        cols.unshift({
            title: "Year",
            dataIndex: "year",
            key: "year",
            editable: false
        });
        return cols;
    })
);

const resultsAlternatives$ = required$.pipe(map((alts) => alts.map((alt) => alt.altId)));

const [useResultsAlternatives] = bind(resultsAlternatives$, []);
const [useResultsColumns] = bind(resultsCols$, []);

const { change$: AlternativeChange$, component: AlternativeDropdown } = dropdown(Object.values(alts));

// {json.optional[0].altId}

export default function AnnualResults() {
    const data = useData();
    console.log(data);

    // [
    //     year:..,
    //     alt1:...,
    //     alt2...,
    // ]

    return (
        <div className={"w-full h-full p-5 "}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>NPV Cash Flow Comparison</Title>
                    <Divider />
                    <NPVComparisonTable columns={useResultsColumns()} />
                </div>
                <div>
                    <Title level={5}>NPV Cash Flows</Title>
                    <Divider />
                </div>
            </div>
            <br />
            <div>
                <h1>Annual Results for Alternative</h1>
                <AlternativeDropdown className={"w-1/4"} label="Annual Results for Alternative" />
            </div>
            <br />
            <Title level={5}>NPV Cash Flow by Alternative</Title>
            <Divider />
            <NPVByAltTable columns={NPVByAltTableCols} />
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
