import { Divider, Typography } from "antd";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { json } from "../../../../docs/FederalFinancedE3Result";
import table from "../../components/Table";
import { dollarFormatter } from "../../util/Util";
import { useResultsAlternatives } from "./AnnualResults";
const { Title } = Typography;

const data$ = of(json);
const measure$ = data$.pipe(map((datas) => datas?.measure));
const optional$ = data$.pipe(map((datas) => datas?.optional));
const LCResultsBaselineTableData$ = measure$.pipe(
    map((alts) => {
        const cols = alts.map((alt) => {
            return {
                key: alt?.altId.toString(),
                alt: alt?.altId,
                base: "No",
                net: dollarFormatter.format(alt?.netSavings) || "0",
                sir: dollarFormatter.format(alt?.sir) || "0",
                airr: dollarFormatter.format(alt?.airr) || "0",
                spp: dollarFormatter.format(alt?.spp) || "0",
                dpp: dollarFormatter.format(alt?.dpp) || "0",
                "energy-change": "0",
                "ghg-change": "0",
                "scc-change": "0",
                "net-scc": "0"
            };
        });
        return cols;
    })
);

const addArray = (array: number[]) => array.reduce((acc, val) => acc + val, 0);

const LCResultsComparisonTableData$ = optional$.pipe(
    map((alts) => {
        const result = alts.reduce((acc, { altId, ...rest }, index: number) => {
            if (!acc[altId]) {
                acc[altId] = [];
            }
            acc[altId][index] = rest;
            return acc;
        }, []);
        const results = result.map(
            (
                subArr: {
                    tag: string;
                    totalTagCashflowDiscounted: number[];
                    totalTagCashflowNonDiscounted: number[];
                    totalTagQuantity: number[];
                    units: string | null;
                }[]
            ) => subArr?.filter(Boolean)
        );

        const cols = results.map((alt, index) => {
            return {
                key: index.toString(),
                alt: index,
                base: "No",
                initial: dollarFormatter.format(addArray(alt[index].totalTagCashflowDiscounted)) || "0",
                lcc: "0",
                energy: "0",
                ghg: "0",
                scc: "0",
                lccscc: "0"
            };
        });

        return cols;
    })
);

const NPVCostsTableData$ = optional$.pipe(
    map((alts) => {
        const result = alts.reduce((acc, { altId, ...rest }, index: number) => {
            if (!acc[altId]) {
                acc[altId] = [];
            }
            acc[altId][index] = rest;
            return acc;
        }, []);
        const results = result.map(
            (
                subArr: {
                    tag: string;
                    totalTagCashflowDiscounted: number[];
                    totalTagCashflowNonDiscounted: number[];
                    totalTagQuantity: number[];
                    units: string | null;
                }[]
            ) => subArr?.filter(Boolean)
        );

        const cols = results.map((alt, index) => {
            return {
                key: index.toString(),
                cost: index
            };
        });

        cols.unshift(
            {
                cost: "Investment"
            },
            { cost: ["Energy", "Consumption"] },
            { cost: "Demand" },
            { cost: "Rebates" },
            { cost: ["Water", "Usage"] },
            { cost: "Disposal" },
            { cost: ["OMR", "Recurring"] },
            { cost: "Non-Recurring" },
            { cost: "Replacement" },
            { cost: "Residal Value" }
        );

        return cols;
    })
);

const { component: LCResultsComparisonTable } = table(LCResultsComparisonTableData$);
const { component: LCResultsBaselineTable } = table(LCResultsBaselineTableData$);
const { component: NPVCostsTable } = table(NPVCostsTableData$);
const { component: LCCResourceTable } = table(NPVCostsTableData$);

const LCResultsComparisonTableColumns = [
    { title: "Alternative", dataIndex: "alt", key: "alt", editable: false, fixed: true },
    { title: "Base Case", dataIndex: "base", key: "base", editable: false, fixed: true },
    { title: "Initial Cost", dataIndex: "initial", key: "initial", editable: false, fixed: true },
    { title: "Life Cycle Cost", dataIndex: "lcc", key: "lcc", editable: false, fixed: true },
    { title: "Energy", dataIndex: "energy", key: "energy", editable: false, fixed: true },
    { title: "GHG Emissions", dataIndex: "ghg", key: "ghg", editable: false, fixed: true },
    { title: "SCC", dataIndex: "scc", key: "scc", editable: false, fixed: true },
    { title: "LCC + SCC", dataIndex: "lccscc", key: "lccscc", editable: false, fixed: true }
];

const LCResultsBaselineTableColumns = [
    { title: "Alternative", dataIndex: "alt", key: "alt", editable: false, fixed: true },
    { title: "Base Case", dataIndex: "base", key: "base", editable: false, fixed: true },
    { title: "Net Savings", dataIndex: "net", key: "net", editable: false, fixed: true },
    { title: "SIR", dataIndex: "sir", key: "sir", editable: false, fixed: true },
    { title: "AIRR", dataIndex: "airr", key: "airr", editable: false, fixed: true },
    { title: "SPP", dataIndex: "spp", key: "spp", editable: false, fixed: true },
    { title: "DPP", dataIndex: "dpp", key: "dpp", editable: false, fixed: true },
    { title: "Change in Energy", dataIndex: "energy-change", key: "energy-change", editable: false, fixed: true },
    { title: "Change in GHG", dataIndex: "ghg-change", key: "ghg-change", editable: false, fixed: true },
    { title: "Change in SCC", dataIndex: "scc-change", key: "scc-change", editable: false, fixed: true },
    { title: "Net Savings & SCC Reductions", dataIndex: "net-scc", key: "net-scc", editable: false, fixed: true }
];

export default function Summary() {
    console.log(useResultsAlternatives());

    const NPVCostsTableColumns = useResultsAlternatives().map((alt) => {
        return {
            title: ` Alt #${alt?.toString()}`,
            dataIndex: alt?.toString(),
            key: alt?.toString(),
            editable: false,
            fixed: false
        };
    });

    NPVCostsTableColumns.unshift({
        title: "Cost",
        dataIndex: "cost",
        key: "cost",
        editable: false,
        fixed: true
    });

    const LCCResourceTableColumns = useResultsAlternatives().map((alt) => {
        return {
            title: ` Alt #${alt?.toString()}`,
            dataIndex: alt?.toString(),
            key: alt?.toString(),
            editable: false,
            fixed: false
        };
    });

    LCCResourceTableColumns.unshift({
        title: "Resources",
        dataIndex: "resources",
        key: "resources",
        editable: false,
        fixed: true
    });

    return (
        <div className={"w-full h-full p-5 "}>
            <div className="">
                <Title level={5}>Life Cycle Results Comparison</Title>
                <Divider />
                <LCResultsComparisonTable
                    editable={false}
                    columns={LCResultsComparisonTableColumns}
                    // scroll={{ x: 300, y: 350 }}
                />
            </div>
            <br />
            <div>
                <Title level={5}>Life Cycle Results Realtive to Baseline Alternative</Title>
                <Divider />
                <LCResultsBaselineTable
                    editable={false}
                    columns={LCResultsBaselineTableColumns}
                    // scroll={{ x: 300, y: 350 }}
                />
            </div>
            <br />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Title level={5}>NPV Costs by Cost Subcategory</Title>
                    <Divider />
                    <NPVCostsTable
                        editable={false}
                        columns={NPVCostsTableColumns}
                        // scroll={{ x: 300, y: 350 }}
                    />
                </div>
                <div>
                    <Title level={5}>Life-Cycle Resource Consumption & Emissions Comparison</Title>
                    <Divider />
                    <LCCResourceTable
                        editable={false}
                        columns={LCCResourceTableColumns}
                        // scroll={{ x: 300, y: 350 }}
                    />
                </div>
            </div>
        </div>
    );
}
