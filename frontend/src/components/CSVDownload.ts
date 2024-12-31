import { Alternative, Cost, Project } from "blcc-format/Format";
import { useEffect } from "react";

const CSVDownload = (project: Project, alternatives: Alternative[], costs: Cost[], summary, annual, altResults) => {
    console.log(project, alternatives, costs, summary, annual, altResults);
    let altNames: string[] = [];
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
        [], //tableData
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
        [], // tableData
        ["NPV Costs by Cost Subcategory"],
        [],
        ["Cost Type", "", ...altNames],
        [], // tableData
        ["Life Cycle Resource Consumption and Emissions Comparison"],
        [],
        ["Resource Type", "", ...altNames],
        [] //tableData
    ];

    // const annualResultsByAlt = annual.map((alt) => {
    //     [
    //         [alt?.name],
    //         [],
    //         ["", "", "Energy", "", "", "Water", "", "OMR", "", "", "", ""],
    //         [
    //             "Year",
    //             "Investment",
    //             "Consumption",
    //             "Demand",
    //             "Rebates",
    //             "Use",
    //             "Disposal",
    //             "Recurring",
    //             "Non-Recurring",
    //             "Replace",
    //             "Residual Value",
    //             "Total"
    //         ],
    //         [] // tableData
    //     ];
    // });

    const annualResults = [
        "NPV Cash Flow Comparison",
        [],
        ["Year", ...altNames],
        [], //tableData
        [],
        ["Annual Results for Alternative"],
        [],
        // ...annualResultsByAlt,
        []
    ];

    // const alternativeResultsByAlt = altResults.map((alt) => {
    //     [
    //         ["alt?.name"],
    //         [],
    //         ["NPV Cash Flow Comparison"],
    //         [],
    //         ["Cost Type", "", alt?.name],
    //         [], // tableData
    //         [],
    //         ["Energy and Water use, Emissions, and Social Cost of GHG"],
    //         [],
    //         ["Resource Type", "", "Consumption", "Emissions"],
    //         [] // tableData
    //     ];
    // });

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
        ...annualResults,
        [],
        [],
        // ...alternativeResultsByAlt,
        []
    ];
    console.log(csvData);
    return csvData;
};

export default CSVDownload;
