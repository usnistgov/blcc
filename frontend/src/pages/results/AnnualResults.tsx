import { Divider, Typography } from "antd";
import { of } from "rxjs";
import { json } from "../../../../docs/FederalFinancedE3Result";
import dropdown from "../../components/Dropdown";
import table from "../../components/Table";

const data$ = of(json);

const { Title } = Typography;

const alts = ["Alt 1", "Alt 2", "Alt 3"];

const { change$: AlternativeChange$, component: AlternativeDropdown } = dropdown(Object.values(alts));

const { component: NPVComparisonTable } = table();
const { component: NPVByAltTable } = table();
const addlCols = alts.map((alt) => {
    return {
        title: alt,
        dataIndex: alt,
        key: alt,
        editable: false
    };
    // return alt;
});

console.log(addlCols);

const NPVComparisonTableCols = [
    {
        title: "Year",
        dataIndex: "year",
        key: "year",
        editable: false
    },
    ...addlCols
];

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
        dataIndex: "investment",
        key: "investment",
        editable: false,
        children: [
            { title: "Consumption", dataIndex: "use", key: "use", editable: false },
            { title: "Demands", dataIndex: "disposal", key: "disposal", editable: false },
            { title: "Rebates", dataIndex: "disposal", key: "disposal", editable: false }
        ]
    },
    {
        title: "Water",
        dataIndex: "investment",
        key: "investment",
        editable: false,
        children: [
            { title: "Use", dataIndex: "use", key: "use", editable: false },
            { title: "Disposal", dataIndex: "disposal", key: "disposal", editable: false }
        ]
    },
    {
        title: "OMR",
        dataIndex: "investment",
        key: "investment",
        editable: false,
        children: [
            { title: "Recurring", dataIndex: "use", key: "use", editable: false },
            { title: "Non-Recurring", dataIndex: "disposal", key: "disposal", editable: false }
        ]
    },
    {
        title: "Replace",
        dataIndex: "investment",
        key: "investment",
        editable: false
    },
    {
        title: "RV",
        dataIndex: "investment",
        key: "investment",
        editable: false
    },
    {
        title: "Total",
        dataIndex: "total",
        key: "total",
        editable: false
    }
];

// {json.optional[0].altId}

export default function AnnualResults() {
    return (
        <div className={"w-full h-full "}>
            <h1>Annual Results for Alternative</h1>
            <AlternativeDropdown className={"w-1/2"} label="Annual Results for Alternative" />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>NPV Cash Flow Comparison</Title>
                    <Divider />
                    <NPVComparisonTable columns={NPVComparisonTableCols} />
                </div>
                <div>
                    <Title level={5}>NPV Cash Flows</Title>
                    <Divider />
                </div>
            </div>
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
