/*
import type { Project } from "blcc-format/Format";
import { db } from "model/db";
import { dollarFormatter } from "util/Util";
import type {
    AltNpvRow,
    AltResults,
    Annual,
    LccBaselineRow,
    LccRow,
    NpvAllRow,
    ResourceUsageRow,
    Summary,
} from "./allResultStreams";

const fetchData = async () => {
    try {
        const result = await db.alternatives.toArray();
        if (!result || result.length === 0) {
            console.log("No alternatives found.");
            return [];
        }
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const alternatives = await fetchData();

const CSVDownload = (project: Project[] | undefined, summary: Summary, annual: Annual, altResults: AltResults) => {
    const altNames: string[] = alternatives?.map((alt) => alt?.name);
    console.log(summary, annual, altResults);

    const lccComparison = summary.lccRows.map((row: LccRow) => Object.values(row)); //TODO: add dollar formatting
    const lccBaseline = summary.lccBaseline.map((row: LccBaselineRow) => Object.values(row)); //TODO: add dollar formatting

    const npvCosts = summary.npvCosts.map((row) => {
        const result = [row.category, row.subcategory];

        for (let i = 0; i < altNames.length; i++) {
            result.push("$" + (row[i] || "0.00"));
        }
        return result;
    });

    const lccResource = summary.lccResourceRows.map((row) => {
        const result = [row.category, row.subcategory];

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
            "LCC + SCC",
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
            "Net Savings & SCC Reductions",
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
        ...lccResource, //tableData
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
        const rows = [
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
                "Total",
            ],
        ];
        alts?.forEach((alt: NpvAllRow) => {
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
                "$" + alt.total || "0.00",
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
        [],
    ];

    const alternativeResultsByAlt = (data: AltResults) => {
        const result: (string | (string | string[])[])[] = [];
        const { altNPV, resourceUsage } = data;

        for (let i = 0; i < altNPV.length; i++) {
            result.push(altNames[i], "", "NPV Cash Flow Comparison", "", ["Cost Type", "", altNames[i]]);

            altNPV[i]?.forEach((item: AltNpvRow) => {
                result.push([item?.category || "", item?.subcategory || "", `$${item?.alternative}` || "$0.00"]);
            });

            result.push("", "Energy and Water use Emissions and Social Cost of GHG", "", [
                "Resource Type",
                "",
                "Consumption",
                "Emissions",
            ]);

            resourceUsage[i]?.forEach((item: ResourceUsageRow) => {
                result.push([
                    `${item?.category}` || "",
                    `${item?.subcategory}` || "",
                    `$${item?.consumption}` || "$0.00",
                    `$${item?.emissions}` || "$0.00",
                ]);
            });

            result.push("");
        }

        return result;
    };

    return [
        [new Date().toLocaleDateString()],
        [new Date().toLocaleTimeString()],
        [],
        ["BLCC Project Results"],
        [project?.[0]?.name],
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
        [],
    ];
};

export default CSVDownload;
*/
