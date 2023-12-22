import { Measures, Optional, Output } from "e3-sdk";
import { Observable, of } from "rxjs";
import { filter, map } from "rxjs/operators";
import { json } from "../../../../docs/FederalFinancedE3Result";
import table from "../../components/Table";
import { dollarFormatter } from "../../util/Util";
import { useResultsAlternatives } from "./AnnualResults";

const data$: Observable<Output> = of(json as unknown as Output);
const measure$ = data$.pipe(
    map((datas) => datas?.measure),
    filter((measure): measure is Measures[] => measure !== undefined)
);
const optional$ = data$.pipe(
    map((datas) => datas?.optional),
    filter((optional): optional is Optional[] => optional !== undefined)
);

type ColType = {
    title: string;
    dataIndex: string;
    key: string;
    editable: boolean;
    fixed: boolean;
    onCell?: (_: never, index: number) => { colSpan: number } | undefined;
};

type LCResults = {
    key: string;
    alt: number;
    base: string;
    net: string;
    sir: string;
    airr: string;
    spp: string;
    dpp: string;
    "energy-change": string;
    "ghg-change": string;
    "scc-change": string;
    "net-scc": string;
};

const LCResultsBaselineTableData$: Observable<LCResults[]> = measure$.pipe(
    map((alts) => {
        const cols = alts?.map((alt) => {
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
        const result = alts.reduce((acc, optional, index: number) => {
            if (!acc[optional.altId]) {
                acc[optional.altId] = [];
            }
            acc[optional.altId][index] = optional;
            return acc;
        }, [] as Optional[][]);

        const results = result.map((subArr: Optional[]) => subArr?.filter(Boolean));

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

const NPVCostsTableData$: Observable<Optional[][]> = optional$.pipe(
    map((alts) => {
        const result = alts.reduce((acc, optional, index: number) => {
            if (!acc[optional.altId]) {
                acc[optional.altId] = [];
            }
            acc[optional.altId][index] = optional;
            return acc;
        }, [] as Optional[][]);

        const results = result.map((subArr: Optional[]) => subArr?.filter(Boolean));

        // const cols = results.map((alt, index) => {
        //     return {
        //         key: index.toString(),
        //         cost: index
        //     };
        // });

        results.unshift(
            { cost: "Investment" },
            { cost: "Energy", "sub-category": "Consumption" },
            { cost: "", "sub-category": "Demand" },
            { cost: "", "sub-category": "Rebates" },
            { cost: "Water", "sub-category": "Usage" },
            { cost: "", "sub-category": "Disposal" },
            { cost: "OMR", "sub-category": "Recurring" },
            { cost: "", "sub-category": "Non-Recurring" },
            { cost: "Replacement" },
            { cost: "Residal Value" }
        );
        return results;
    })
);

const LCCResourceTableData$ = optional$.pipe(
    map((alts) => {
        const result = alts.reduce((acc, optional, index: number) => {
            if (!acc[optional.altId]) {
                acc[optional.altId] = [];
            }
            acc[optional.altId][index] = optional;
            return acc;
        }, [] as Optional[][]);
        const results = result.map((subArr: Optional[]) => subArr?.filter(Boolean));

        const cols = results.map((alt, index) => {
            return {
                key: index.toString(),
                resources: index
            };
        });

        cols.unshift(
            { resources: "Consumption", "sub-category": "Electricity" },
            { resources: "", "sub-category": "Natural Gas" },
            { resources: "", "sub-category": "Fuel Oil" },
            { resources: "", "sub-category": "Propane" },
            { resources: "", "sub-category": "Total" },
            { resources: "Emissions", "sub-category": "Electricity" },
            { resources: "", "sub-category": "Natural Gas" },
            { resources: "", "sub-category": "Fuel Oil" },
            { resources: "", "sub-category": "Propane" },
            { resources: "", "sub-category": "Total" },
            { resources: "Water", "sub-category": "Use" }
        );

        return cols;
    })
);

const { component: LCResultsComparisonTable } = table(LCResultsComparisonTableData$);
const { component: LCResultsBaselineTable } = table(LCResultsBaselineTableData$);
const { component: NPVCostsTable } = table(NPVCostsTableData$);
const { component: LCCResourceTable } = table(LCCResourceTableData$);

const LCResultsComparisonTableColumns = [
    { title: "Alternative", dataIndex: "alt", key: "alt", editable: false, fixed: true },
    { title: "Base Case", dataIndex: "base", key: "base", editable: false, fixed: true },
    { title: "Initial Cost", dataIndex: "initial", key: "initial", editable: false, fixed: true, align: "right" },
    { title: "Life Cycle Cost", dataIndex: "lcc", key: "lcc", editable: false, fixed: true, align: "right" },
    { title: "Energy", dataIndex: "energy", key: "energy", editable: false, fixed: true, align: "right" },
    { title: "GHG Emissions", dataIndex: "ghg", key: "ghg", editable: false, fixed: true, align: "right" },
    { title: "SCC", dataIndex: "scc", key: "scc", editable: false, fixed: true, align: "right" },
    { title: "LCC + SCC", dataIndex: "lccscc", key: "lccscc", editable: false, fixed: true, align: "right" }
];

const LCResultsBaselineTableColumns = [
    { title: "Alternative", dataIndex: "alt", key: "alt", editable: false, fixed: true },
    { title: "Base Case", dataIndex: "base", key: "base", editable: false, fixed: true },
    { title: "Net Savings", dataIndex: "net", key: "net", editable: false, fixed: true, align: "right" },
    { title: "SIR", dataIndex: "sir", key: "sir", editable: false, fixed: true, align: "right" },
    { title: "AIRR", dataIndex: "airr", key: "airr", editable: false, fixed: true, align: "right" },
    { title: "SPP", dataIndex: "spp", key: "spp", editable: false, fixed: true, align: "right" },
    { title: "DPP", dataIndex: "dpp", key: "dpp", editable: false, fixed: true, align: "right" },
    {
        title: "Change in Energy",
        dataIndex: "energy-change",
        key: "energy-change",
        editable: false,
        fixed: true,
        align: "right"
    },
    {
        title: "Change in GHG",
        dataIndex: "ghg-change",
        key: "ghg-change",
        editable: false,
        fixed: true,
        align: "right"
    },
    {
        title: "Change in SCC",
        dataIndex: "scc-change",
        key: "scc-change",
        editable: false,
        fixed: true,
        align: "right"
    },
    {
        title: "Net Savings & SCC Reductions",
        dataIndex: "net-scc",
        key: "net-scc",
        editable: false,
        fixed: true,
        align: "right"
    }
];

export default function Summary() {
    const NPVCostsTableColumns: ColType[] = useResultsAlternatives().map((alt) => {
        return {
            title: ` Alt #${alt?.toString()}`,
            dataIndex: alt?.toString(),
            key: alt?.toString(),
            editable: false,
            fixed: false
        };
    });

    NPVCostsTableColumns.unshift(
        {
            title: "Cost",
            dataIndex: "cost",
            key: "cost",
            editable: false,
            fixed: true,
            onCell: (_: never, index: number) => {
                if (index === 0 || index === 8 || index === 9) {
                    return { colSpan: 2 };
                }
            }
        },
        {
            title: "Sub Category",
            dataIndex: "sub-category",
            key: "sub-category",
            editable: false,
            fixed: true
        }
    );

    const LCCResourceTableColumns: ColType[] = useResultsAlternatives().map((alt) => {
        return {
            title: ` Alt #${alt?.toString()}`,
            dataIndex: alt?.toString(),
            key: alt?.toString(),
            editable: false,
            fixed: false
        };
    });

    LCCResourceTableColumns.unshift(
        {
            title: "Resources",
            dataIndex: "resources",
            key: "resources",
            editable: false,
            fixed: true
        },
        {
            title: "",
            dataIndex: "sub-category",
            key: "sub-category",
            editable: false,
            fixed: true
        }
    );

    return (
        <div className={"w-full h-full p-5 "}>
            <LCResultsComparisonTable
                editable={false}
                columns={LCResultsComparisonTableColumns}
                title="Life Cycle Results Comparison"
                // scroll={{ x: 300, y: 350 }}
            />
            <br />
            <LCResultsBaselineTable
                editable={false}
                columns={LCResultsBaselineTableColumns}
                title="Life Cycle Results Realtive to Baseline Alternative"
                // scroll={{ x: 300, y: 350 }}
            />
            <br />
            <div className="grid grid-cols-2 gap-4">
                <NPVCostsTable
                    editable={false}
                    columns={NPVCostsTableColumns}
                    title="NPV Costs by Cost Subcategory"
                    // scroll={{ x: 300, y: 350 }}
                />
                <LCCResourceTable
                    editable={false}
                    columns={LCCResourceTableColumns}
                    title="Life-Cycle Resource Consumption & Emissions Comparison"
                    // scroll={{ x: 300, y: 350 }}
                />
            </div>
        </div>
    );
}
