import { Alternative, Project } from "blcc-format/Format";
import { lccRow } from "./allResultStreams";

type lccBaselineRow = {
    airr: number;
    baseline: boolean;
    deltaEnergy: number;
    deltaGhg: number;
    deltaScc: number;
    dpp: number;
    initialCost: number;
    lifeCycleCost?: number; //has to be fixed once lifecycle cost is added to backend
    name: string | undefined;
    netSavings: number;
    sir: number;
    spp: number;
};

type lccResourceRow = {
    category?: string;
    subcategory: string;
    [key: string]: string | undefined;
};

type summary = {
    lccBaseline: lccBaselineRow[];
    lccResourceRows: lccResourceRow[];
    lccRows: lccRow[];
    npvCosts: { [key: string]: string }[];
};

// remove this once Luke pushes change
type npvAllRow = {
    year: number;
    investment: number;
    consumption: number;
    recurring: number;
    nonRecurring: number;
    total: number;
};

{
    // remove previous and uncomment this
    // type npvAllRow = {
    //     year: number;
    //     investment: number;
    //     consumption: number;
    //     demand: number;
    //     rebates: number;
    //     waterUse: number;
    //     waterDisposal: number;
    //     recurring: number;
    //     nonRecurring: number;
    //     replace: number;
    //     residualValue: number;
    //     total: number;
    // };
}

type annualNPVComparisonRow = {
    key: number;
    year: number;
    [key: string]: string | number;
};

type annual = {
    npvAll: npvAllRow[][];
    npvComparison: annualNPVComparisonRow[];
};

type altNpvRow = {
    category?: string;
    subcategory?: string;
    alternative?: number;
};

type resourceUsageRow = {
    category?: string;
    subcategory?: string;
    emissions?: number;
    consumption?: number;
};

type altResults = {
    altNPV: altNpvRow[][];
    resourceUsage: resourceUsageRow[][];
};

const CSVDownload = (
    project: Project,
    alternatives: Alternative[],
    summary: summary,
    annual: annual,
    altResults: altResults
) => {
    let altNames: string[] = alternatives?.map((alt) => alt?.name);
    console.log(summary, annual, altResults);

    const lccComparison = summary?.lccRows?.map((row: lccRow) => {
        return [
            row?.name,
            row?.baseline,
            "$" + row?.initialCost || "0.00",
            "$" + row?.lifeCycleCost || "0.00",
            "$" + row?.energy || "0.00",
            "$" + row?.ghgEmissions || "0.00",
            "$" + row?.scc || "0.00",
            "$" + row?.lccScc || "0.00"
        ];
    });

    const lccBaseline = summary?.lccBaseline?.map((row: lccBaselineRow) => {
        return [
            row?.name,
            row?.baseline,
            "$" + row?.initialCost || "0.00",
            "$" + row?.sir || "0.00",
            "$" + row?.airr || "0.00",
            "$" + row?.spp || "0.00",
            "$" + row?.dpp || "0.00",
            "$" + row?.deltaEnergy || "0.00",
            "$" + row?.deltaGhg || "0.00",
            "$" + row?.deltaScc || "0.00",
            "$" + row?.netSavings || "0.00"
        ];
    });

    const npvCosts = summary?.npvCosts?.map((row) => {
        const result = [row?.category, row?.subcategory];

        for (let i = 0; i < altNames.length; i++) {
            result.push("$" + (row[i] || "0.00"));
        }
        return result;
    });

    const lccResource = summary?.lccResourceRows?.map((row) => {
        const result = [row?.category, row?.subcategory];

        for (let i = 0; i < altNames.length; i++) {
            result.push("$" + (row[i] || "0.00"));
        }
        return result;
    });

    const summaryResults = [
        "Life Cycle Results Comparison",
        [],
        [
            "Alternative",
            "Base Case",
            "Initial Cost",
            "Life Cycle Cost",
            "Energy",
            "GHG Emissions (kg co2)",
            "SCC",
            "LCC + SCC"
        ],
        ...lccComparison, //tableData
        [],
        ["Life Cycle Results Relative to Baseline Alternative"],
        [],
        [
            "Alternative",
            "Base Case",
            "Initial Cost",
            "SIRR",
            "AIRR",
            "SPP",
            "DPP",
            "Change in Energy",
            "Change in GHG (kg co2)",
            "Change in SCC",
            "Net Savings & SCC Reductions"
        ],
        ...lccBaseline, // tableData
        [],
        ["NPV Costs by Cost Subcategory"],
        [],
        ["Cost Type", "", ...altNames],
        ...npvCosts, // tableData
        [],
        ["Life Cycle Resource Consumption and Emissions Comparison"],
        [],
        ["Resource Type", "", ...altNames],
        ...lccResource //tableData
    ];

    const npvCashFlow = annual?.npvComparison?.map((alt) => {
        const result = [alt.year];
        for (let i = 0; i < altNames.length; i++) {
            // @ts-ignore
            result.push("$" + (alt[i] || "0.00"));
        }
        return result;
    });

    const annualResultsByAlt = annual?.npvAll?.flatMap((alts, index: number) => {
        let rows = [
            [altNames[index] || "Unknown"],
            [],
            ["", "", "Energy", "", "", "Water", "", "OMR", "", "", "", ""],
            [
                "Year",
                "Investment",
                "Consumption",
                "Demand",
                "Rebates",
                "Use",
                "Disposal",
                "Recurring",
                "Non-Recurring",
                "Replace",
                "Residual Value",
                "Total"
            ]
        ];
        alts?.forEach((alt: npvAllRow) => {
            rows.push([
                `${alt?.year}`,
                "$" + alt?.investment || "0.00",
                "$" + alt?.consumption || "0.00",
                "$" + alt?.recurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt?.nonRecurring || "0.00",
                "$" + alt.total || "0.00"
            ]);
        });
        rows.push([]);
        return rows;
    });

    const annualResults = [
        "NPV Cash Flow Comparison",
        [],
        ["Year", ...altNames],
        ...npvCashFlow, //tableData
        [],
        "Annual Results for Alternative",
        [],
        ...annualResultsByAlt,
        []
    ];

    const alternativeResultsByAlt = (data: altResults) => {
        const result: (string | (string | string[])[])[] = [];
        const { altNPV, resourceUsage } = data;

        for (let i = 0; i < altNPV.length; i++) {
            result.push(altNames[i], "", "NPV Cash Flow Comparison", "", ["Cost Type", "", altNames[i]]);

            altNPV[i]?.forEach((item: altNpvRow) => {
                result.push([item?.category || "", item?.subcategory || "", `$${item?.alternative}` || "$0.00"]);
            });

            result.push("", "Energy and Water use Emissions and Social Cost of GHG", "", [
                "Resource Type",
                "",
                "Consumption",
                "Emissions"
            ]);

            resourceUsage[i]?.forEach((item: resourceUsageRow) => {
                result.push([
                    `${item?.category}` || "",
                    `${item?.subcategory}` || "",
                    `$${item?.consumption}` || "$0.00",
                    `$${item?.emissions}` || "$0.00"
                ]);
            });

            result.push("");
        }

        return result;
    };

    let csvData = [
        [new Date().toLocaleDateString()],
        [new Date().toLocaleTimeString()],
        [],
        ["BLCC Project Results"],
        [project?.name],
        [],
        ["Summary"],
        [],
        ...summaryResults,
        [],
        ["Annual Results"],
        [],
        ...annualResults,
        [],
        ["Alternative Results"],
        [],
        ...alternativeResultsByAlt(altResults),
        []
    ];
    return csvData;
};

export default CSVDownload;
