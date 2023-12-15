import { Divider, Typography } from "antd";
import { of } from "rxjs";
import { json } from "../../../../docs/FederalFinancedE3Result";

import table from "../../components/Table";
import { useResultsAlternatives } from "./AnnualResults";
const data$ = of(json);

const { Title } = Typography;

const { component: LCResultsComparisonTable } = table();
const { component: LCResultsBaselineTable } = table();

const LCResultsComparisonTableColumns = [
    { title: "Alterntaive", dataIndex: "alt", key: "alt", editable: false, fixed: true },
    { title: "Base Case", dataIndex: "base", key: "base", editable: false, fixed: true },
    { title: "Initial Cost", dataIndex: "initial", key: "initial", editable: false, fixed: true },
    { title: "Life Cycle Cost", dataIndex: "lcc", key: "lcc", editable: false, fixed: true },
    { title: "Energy", dataIndex: "energy", key: "energy", editable: false, fixed: true },
    { title: "GHG Emissions", dataIndex: "ghg", key: "ghg", editable: false, fixed: true },
    { title: "SCC", dataIndex: "scc", key: "scc", editable: false, fixed: true },
    { title: "LCC + SCC", dataIndex: "lccscc", key: "lccscc", editable: false, fixed: true }
];

const LCResultsBaselineTableColumns = [
    { title: "Alterntaive", dataIndex: "alt", key: "alt", editable: false, fixed: true },
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
                </div>
                <div>
                    <Title level={5}>Life-Cycle Resource Consumption & Emissions Comparison</Title>
                    <Divider />
                </div>
            </div>
        </div>
    );
}
