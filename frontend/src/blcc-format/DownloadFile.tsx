import type { Output, RequestBuilder } from "@lrd/e3-sdk";
import type { DocumentProps } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { Defaults } from "blcc-format/Defaults";
import type { AltResults, Annual, GraphSources, NpvCashflowComparisonSummary, Summary } from "blcc-format/ExportTypes";
import * as ShareOfEnergyUse from "components/graphs/alternative-results/ShareOfEnergyUse";
import * as ShareOfLcc from "components/graphs/alternative-results/ShareOfLcc";
import * as NpvCashFlowGraph from "components/graphs/annual-results/NpvCashFlowGraph";
import * as AlternativeCashFlowGraph from "components/graphs/annual-results/AlternativeCashFlowGraph";
import Pdf from "components/Pdf";
import { Effect } from "effect";
import html2canvas from "html2canvas";
import { DexieService } from "model/db";
import type React from "react";
import {
    createAnnualCostTypeNpvCashflowRow,
    createAlternativeNpvCostTypeTotalRow,
    createLccBaselineRows,
    createLccComparisonRows,
    createLccResourceRows,
    createNpvCashflowComparisonRow,
    createNpvCategoryRow,
    createResourceUsageRow,
    type NpvCashflowComparisonRow,
} from "util/ResultCalculations";
import {
    createAlternativeNameMap,
    dollarFormatter,
    findBaselineID,
    groupOptionalByTag,
    numberFormatter,
    percentFormatter,
    wholeNumberFormatter,
} from "util/Util";
import { PdfLoadingModel } from "components/modal/PdfLoadingModal";

/**
 * Accepts a JSON object and a filename and converts it to a string and downloads the file.
 *
 * @param blob The blob to download
 * @param filename The name for the file.
 * @param mime The mime type of the file.
 */
export function download(blob: Blob, filename: string, mime: string) {
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = [mime, link.download, link.href].join(":");
    link.click();
}

/**
 * An effect that downloads a file and sets the dirty check hash to be the hash of the current project.
 */
export const downloadBlccFile = (downloadName?: string) =>
    Effect.gen(function* () {
        const db = yield* DexieService;
        const project = yield* db.getProject();

        yield* db.hashCurrent.pipe(Effect.andThen(db.setHash));

        const blob = yield* db.exportDB;
        download(blob, `${downloadName ?? project.name}.blcc`, "text/json");
    });

export const downloadPdf = Effect.gen(function* () {
    const db = yield* DexieService;
    const project = yield* db.getProject();

    const alternatives = yield* db.getAlternatives;
    const costs = yield* db.getCosts;

    // If no baseline ID is found, return -1 since that will just mean no baseline matches it.
    const baselineID = findBaselineID(alternatives) ?? Defaults.INVALID_ID;
    const nameMap = createAlternativeNameMap(alternatives);

    const results: Output[] = yield* db.getResults;
    const firstResult = results[0]; //FIXME Make the results getting more intelligent

    const required = firstResult.required ?? [];
    const measures = firstResult.measure ?? [];
    const optionals = firstResult.optional ?? [];
    const optionalsByTag = groupOptionalByTag(optionals);

    const summary: Summary = {
        lccComparisonRows: createLccComparisonRows(measures, nameMap, baselineID),
        lccBaseline: createLccBaselineRows(measures, nameMap, baselineID),
        npvCosts: createNpvCategoryRow(measures),
        lccResourceRows: createLccResourceRows(measures),
    };

    const annual: Annual = {
        alternativeNpvCashflows: project.alternatives.map((id) =>
            createAnnualCostTypeNpvCashflowRow(required, optionalsByTag, id, true),
        ),
        npvCashflowComparison: [...createNpvCashflowComparisonRow(required)],
        npvCashflowComparisonSummary: getSummaryRow(),
    };

    function getSummaryRow(): NpvCashflowComparisonSummary {
        let alternativeId: number;
        const summaryRow: NpvCashflowComparisonSummary = { key: -1 };
        for (let i = 0; i < project.alternatives.length; i++) {
            alternativeId = alternatives[i].id ?? 0;
            summaryRow[alternativeId] = measures[i].totalCosts;
        }
        return summaryRow;
    }

    const altResults: AltResults = {
        alternativeNpvByCostType: measures.map((measure) => createAlternativeNpvCostTypeTotalRow(measure)),
        resourceUsage: measures.map((measure) => createResourceUsageRow(measure)),
    };

    const npvCashFlowGraph: HTMLElement | null = document.getElementById(NpvCashFlowGraph.OFFSCREEN_GRAPH_ID);
    const cashFlowBySubtype: HTMLElement[] | null = Array.from(
        document.getElementsByClassName(AlternativeCashFlowGraph.OFFSCREEN_GRAPH_CLASS),
    ) as HTMLElement[];
    const shareOfEnergyUse: HTMLElement[] | null = Array.from(
        document.getElementsByClassName(ShareOfEnergyUse.OFFSCREEN_GRAPH_CLASS),
    ) as HTMLElement[];
    const shareOfLcc: HTMLElement[] | null = Array.from(
        document.getElementsByClassName(ShareOfLcc.OFFSCREEN_GRAPH_CLASS),
    ) as HTMLElement[];

    const graphSources: GraphSources = {
        annualCashFlows: yield* getGraphSource(npvCashFlowGraph as HTMLElement),
        cashFlowBySubtype: yield* Effect.all(
            cashFlowBySubtype.map((ele) => getGraphSource(ele)),
            { concurrency: "unbounded" },
        ),
        shareOfEnergyUse: yield* Effect.all(
            shareOfEnergyUse.map((ele) => getGraphSource(ele)),
            { concurrency: "unbounded" },
        ),
        shareOfLcc: yield* Effect.all(
            shareOfLcc.map((ele) => getGraphSource(ele)),
            { concurrency: "unbounded" },
        ),
    };

    const blob = yield* createPdfBlob(
        <Pdf
            project={project}
            alternatives={alternatives}
            costs={costs}
            summary={summary}
            annual={annual}
            altResults={altResults}
            graphSources={graphSources}
        />,
    );

    download(blob, `${project.name}.pdf`, "application/pdf");
    PdfLoadingModel.setShowLoadingModal(false);
});

const getGraphSource = (graph: HTMLElement) =>
    Effect.promise(() => html2canvas(graph).then((canvas) => canvas.toDataURL("image/png")));

const createPdfBlob = (element: React.ReactElement<DocumentProps>) =>
    Effect.tryPromise({
        try: () => pdf(element).toBlob(),
        catch: (error) => Effect.logError(error),
    });

function wrapCell(value: number | string | boolean): string {
    return `"${value}"`;
}

export const downloadCsv = Effect.gen(function* () {
    const db = yield* DexieService;
    const project = yield* db.getProject();

    const alternatives = yield* db.getAlternatives;
    const costs = yield* db.getCosts;

    // If no baseline ID is found, return -1 since that will just mean no baseline matches it.
    const baselineID = findBaselineID(alternatives) ?? Defaults.INVALID_ID;
    const nameMap = createAlternativeNameMap(alternatives);

    const results: Output[] = yield* db.getResults;
    const firstResult = results[0]; //FIXME Make the results getting more intelligent

    const required = firstResult.required ?? [];
    const measures = firstResult.measure ?? [];
    const optionals = firstResult.optional ?? [];
    const optionalsByTag = groupOptionalByTag(optionals);

    const summary: Summary = {
        lccComparisonRows: createLccComparisonRows(measures, nameMap, baselineID),
        lccBaseline: createLccBaselineRows(measures, nameMap, baselineID),
        npvCosts: createNpvCategoryRow(measures),
        lccResourceRows: createLccResourceRows(measures),
    };

    const altNames = alternatives.map((alt) => alt.name);

    const summaryResults = [
        "Life Cycle Results Comparison",
        [],
        ["Alternative", "Base Case", "Investment", "Life Cycle Cost", "Energy (gJ)", "GHG Emissions (kg CO2e)"],
        ...summary.lccComparisonRows.map((row) =>
            [
                row.name,
                row.baseline,
                dollarFormatter.format(row.investment),
                dollarFormatter.format(row.lifeCycleCost),
                wholeNumberFormatter.format(row.energy),
                wholeNumberFormatter.format(row.ghgEmissions),
            ].map(wrapCell),
        ),
        [],
        ["Life Cycle Results Relative to Baseline Alternative"],
        [],
        [
            "Alternative",
            "Base Case",
            "LCC",
            "Investment",
            "Net Savings",
            "SIR",
            "AIRR",
            "SPP",
            "DPP",
            "Change in Energy",
            "Change in GHG (kg CO2e)",
        ],
        ...summary.lccBaseline.map((row) =>
            [
                row.name,
                row.baseline,
                dollarFormatter.format(row.lcc),
                dollarFormatter.format(row.investment),
                dollarFormatter.format(row.netSavings),
                numberFormatter.format(row.sir),
                percentFormatter.format(row.airr),
                numberFormatter.format(row.spp),
                numberFormatter.format(row.dpp),
                wholeNumberFormatter.format(row.deltaEnergy),
                wholeNumberFormatter.format(row.deltaGhg),
            ].map(wrapCell),
        ),
        [],
        ["NPV Costs by Cost Subcategory"],
        [],
        ["Cost Category", "Cost Subcategory", ...altNames],
        ...summary.npvCosts.map((row) => {
            const { category, subcategory, ...rest } = row;

            return [
                category ?? "",
                subcategory ?? "",
                ...Object.values(rest).map((value) => dollarFormatter.format(value ?? 0)),
            ].map(wrapCell);
        }),
        [],
        ["Life Cycle Resource Consumption and Emissions Comparison"],
        [],
        ["Resource Category", "Resource Subcategory", ...altNames],
        ...summary.lccResourceRows.map((row) => {
            const { category, subcategory, units, ...rest } = row;

            return [
                category ?? "",
                subcategory ?? "",
                ...Object.values(rest).map((value) => wholeNumberFormatter.format(value ?? 0)),
            ].map(wrapCell);
        }),
    ];

    const annual: Annual = {
        alternativeNpvCashflows: project.alternatives.map((id) =>
            createAnnualCostTypeNpvCashflowRow(required, optionalsByTag, id, true),
        ),
        npvCashflowComparison: createNpvCashflowComparisonRow(required),
        npvCashflowComparisonSummary: getSummaryRow(),
    };

    function getSummaryRow(): NpvCashflowComparisonSummary {
        let alternativeId: number;
        const summaryRow: NpvCashflowComparisonSummary = {};
        for (let i = 0; i < project.alternatives.length; i++) {
            alternativeId = alternatives[i].id ?? 0;
            summaryRow[alternativeId] = measures[i].totalCosts;
        }
        return summaryRow;
    }

    const annualResults = [
        "NPV Cash Flow Comparison",
        [],
        ["Year", ...altNames],
        ...annual.npvCashflowComparison.map((row) => {
            const { year, key, ...rest } = row;
            return [year, ...Object.values(rest).map(dollarFormatter.format)].map(wrapCell);
        }),
        [
            "Total",
            alternatives
                .map((alt) => dollarFormatter.format((annual.npvCashflowComparisonSummary[`${alt.id}`] as number) ?? 0))
                .map(wrapCell),
        ],
        [],
        "Annual Results for Alternative",
        [],
        ...annual.alternativeNpvCashflows.flatMap((altFlows, i) => {
            return [
                altNames[i],
                ["", "Energy", "", "", "Water", "", "Capital", "", "", "", "Contract", "", "Other", ""],
                [
                    "Year",
                    "Consumption",
                    "Demand",
                    "Rebates",
                    "Use",
                    "Disposal",
                    "Investment",
                    "OMR",
                    "Replace",
                    "Residual Value",
                    "Non-Recurring",
                    "Recurring",
                    "Monetary",
                    "Total",
                ],
                ...altFlows.map((row) => {
                    return [
                        row.year,
                        dollarFormatter.format(row.consumption ?? 0),
                        dollarFormatter.format(row.demand ?? 0),
                        dollarFormatter.format(row.rebates ?? 0),
                        dollarFormatter.format(row.waterUse ?? 0),
                        dollarFormatter.format(row.waterDisposal ?? 0),
                        dollarFormatter.format(row.investment ?? 0),
                        dollarFormatter.format(row.omr ?? 0),
                        dollarFormatter.format(row.replace ?? 0),
                        dollarFormatter.format(row.residualValue ?? 0),
                        dollarFormatter.format(row.implementation ?? 0),
                        dollarFormatter.format(row.recurringContract ?? 0),
                        dollarFormatter.format(row.otherCosts ?? 0),
                        dollarFormatter.format(row.total ?? 0),
                    ].map(wrapCell);
                }),
                [],
            ];
        }),
        [],
    ];

    const csv = [
        [new Date().toLocaleDateString()],
        [new Date().toLocaleTimeString()],
        [],
        ["BLCC Project Results"],
        [project.name],
        [],
        ["Summary"],
        [],
        ...summaryResults,
        [],
        ["Annual Results"],
        [],
        ...annualResults,
    ];

    const blob = yield* createCsvBlob(csv.join("\n"));

    download(blob, `${project.name}.csv`, "text/csv");
});

const createCsvBlob = (csv: string) => Effect.sync(() => new Blob([csv], { type: "text/csv" }));

export const downloadE3Request = (builder: RequestBuilder) =>
    Effect.gen(function* () {
        const db = yield* DexieService;
        const project = yield* db.getProject();

        if (project === undefined) return;

        download(
            new Blob([JSON.stringify(builder.build(), null, 2)], {
                type: "application/json",
            }),
            `${project.name}-E3.json`,
            "application/json",
        );
    });
