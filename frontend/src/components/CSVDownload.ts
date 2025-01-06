import { Alternative, Cost, Project } from "blcc-format/Format";

const CSVDownload = (project: Project, alternatives: Alternative[], costs: Cost[], summary, annual, altResults) => {
    let altNames: string[] = alternatives.map((alt) => alt.name);

    const lccComparison = summary.lccRows.map((row) => {
        return [
            row?.name,
            row?.baseline,
            row?.initialCost,
            row?.lifeCycleCost,
            row?.energy,
            row?.ghgEmissions,
            row?.scc,
            row?.lccScc
        ];
    });

    const lccBaseline = summary.lccBaseline.map((row) => {
        return [
            row?.name,
            row?.baseline,
            row?.initialCost,
            row?.sir,
            row?.airr,
            row?.spp,
            row?.dpp,
            row?.deltaEnergy,
            row?.deltaGhg,
            row?.deltaScc,
            row?.netSavings
        ];
    });

    const npvCosts = summary.npvCosts.map((row) => {
        return [row?.category, row?.subcategory, "$" + row["0"] || "0.00", "$" + row["1"] || "0.00"];
    });

    const lccResource = summary.lccResourceRows.map((row) => {
        return [row?.category, row?.subcategory, "$" + row["0"] || "0.00", "$" + row["1"] || "0.00"];
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
        return [alt.year, "$" + alt["0"] || "0.00", "$" + alt["1"] || "0.00"];
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
        alts?.forEach((alt) => {
            rows.push([
                alt.year,
                "$" + alt?.investment || 0,
                "$" + alt?.consumption || 0,
                "$" + alt?.recurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt?.nonRecurring || 0,
                "$" + alt.total || 0
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

    const alternativeResultsByAlt = (data) => {
        const result = [];
        const { altNPV, resourceUsage } = data;

        for (let i = 0; i < altNPV.length; i++) {
            result.push(altNames[i], "", "NPV Cash Flow Comparison", "", ["Cost Type", "", altNames[i]]);

            altNPV[i].forEach((item) => {
                result.push([item?.category || "", item?.subcategory || "", "$" + (item?.alternative || "0.00")]);
            });

            result.push("", "Energy and Water use, Emissions, and Social Cost of GHG", "", [
                "Resource Type",
                "",
                "Consumption",
                "Emissions"
            ]);

            resourceUsage[i].forEach((item) => {
                result.push([
                    item?.category || "",
                    [item?.subcategory || ""],
                    "$" + (item?.consumption || "0.00"),
                    "$" + (item?.emissions || "0.00")
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
