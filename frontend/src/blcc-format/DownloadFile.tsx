import type { AnalysisBuilder, Output, RequestBuilder } from "@lrd/e3-sdk";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { Defaults } from "blcc-format/Defaults";
import type { AltResults, Annual, Summary } from "blcc-format/ExportTypes";
import Pdf from "components/Pdf";
import { Console, Effect } from "effect";
import { exportDB, getAlternatives, getCosts, getProject, getResults, hashCurrentAndSet } from "model/db";
import type React from "react";
import {
    createAlternativeNpvCashflowRow,
    createAlternativeNpvCashflowTotalRow,
    createLccBaselineRows,
    createLccComparisonRows,
    createLccResourceRows,
    createNpvCashflowComparisonRow,
    createNpvCategoryRow,
    createResourceUsageRow,
} from "util/ResultCalculations";
import {
    createAlternativeNameMap,
    dollarFormatter,
    findBaselineID,
    groupOptionalByTag,
    numberFormatter,
} from "util/Util";

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
export const downloadBlccFile = Effect.gen(function* () {
    const project = yield* getProject(1);

    if (project === undefined) return;

    yield* hashCurrentAndSet;
    const blob = yield* exportDB;
    download(blob, `${project.name}.blcc`, "text/json");
});

export const downloadPdf = Effect.gen(function* () {
    const project = yield* getProject(Defaults.PROJECT_ID);

    if (project === undefined) return;

    const alternatives = yield* getAlternatives;
    const costs = yield* getCosts;

    // If no baseline ID is found, return -1 since that will just mean no baseline matches it.
    const baselineID = findBaselineID(alternatives) ?? Defaults.INVALID_ID;
    const nameMap = createAlternativeNameMap(alternatives);

    const results: Output[] = yield* getResults;
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
            createAlternativeNpvCashflowRow(required, optionalsByTag, id),
        ),
        npvCashflowComparison: createNpvCashflowComparisonRow(required),
    };

    const altResults: AltResults = {
        alternativeNpvCashflowTotal: measures.map((measure) => createAlternativeNpvCashflowTotalRow(measure)),
        resourceUsage: measures.map((measure) => createResourceUsageRow(measure)),
    };

    //TODO re-add pdf graphs
    /*
            const pdfGraphs = document.getElementsByClassName("result-graph");
            // if (pdfGraphs.length === 0) return;

            const promises = [...pdfGraphs].map((graph) =>
                htmlToImage.toPng(graph as HTMLElement).then((graphSrc) => graphSrc),
            );
     */

    const blob = yield* createPdfBlob(
        <Pdf
            project={project}
            alternatives={alternatives}
            costs={costs}
            summary={summary}
            annual={annual}
            altResults={altResults}
            graphSources={[]}
        />,
    );

    download(blob, `${project.name}.pdf`, "application/pdf");
});

const createPdfBlob = (element: React.ReactElement<DocumentProps>) =>
    Effect.tryPromise({ try: () => pdf(element).toBlob(), catch: (error) => Effect.logError(error) });

function wrapCell(value: number | string | boolean): string {
    return `"${value}"`;
}

export const downloadCsv = Effect.gen(function* () {
    const project = yield* getProject(Defaults.PROJECT_ID);

    if (project === undefined) return;

    const alternatives = yield* getAlternatives;
    const costs = yield* getCosts;

    // If no baseline ID is found, return -1 since that will just mean no baseline matches it.
    const baselineID = findBaselineID(alternatives) ?? Defaults.INVALID_ID;
    const nameMap = createAlternativeNameMap(alternatives);

    const results: Output[] = yield* getResults;
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
        [
            "Alternative",
            "Base Case",
            "Initial Cost",
            "Life Cycle Cost",
            "Energy",
            "GHG Emissions (kg co2)"
        ],
        ...summary.lccComparisonRows.map((row) =>
            [
                row.name,
                row.baseline,
                dollarFormatter.format(row.initialCost),
                dollarFormatter.format(row.lifeCycleCost),
                numberFormatter.format(row.energy),
                numberFormatter.format(row.ghgEmissions)
            ].map(wrapCell),
        ),
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
            "Change in GHG (kg co2)"
        ],
        ...summary.lccBaseline.map((row) =>
            [
                row.name,
                row.baseline,
                dollarFormatter.format(row.initialCost),
                numberFormatter.format(row.sir),
                numberFormatter.format(row.airr),
                numberFormatter.format(row.spp),
                numberFormatter.format(row.dpp),
                numberFormatter.format(row.deltaEnergy),
                numberFormatter.format(row.deltaGhg)
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
            const { category, subcategory, ...rest } = row;

            return [
                category ?? "",
                subcategory ?? "",
                ...Object.values(rest).map((value) => numberFormatter.format(value ?? 0)),
            ].map(wrapCell);
        }),
    ];

    const annual: Annual = {
        alternativeNpvCashflows: project.alternatives.map((id) =>
            createAlternativeNpvCashflowRow(required, optionalsByTag, id),
        ),
        npvCashflowComparison: createNpvCashflowComparisonRow(required),
    };

    const annualResults = [
        "NPV Cash Flow Comparison",
        [],
        ["Year", ...altNames],
        ...annual.npvCashflowComparison.map((row) => {
            const { year, key, ...rest } = row;
            return [year, ...Object.values(rest).map(dollarFormatter.format)].map(wrapCell);
        }),
        [],
        "Annual Results for Alternative",
        [],
        ...annual.alternativeNpvCashflows.flatMap((altFlows, i) => {
            console.log(altFlows);
            return [
                altNames[i],
                ["", "", "Energy", "", "", "Water", "", "OMR"],
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
                ...altFlows.map((row) => {
                    console.log(row);
                    return [
                        row.year,
                        dollarFormatter.format(row.investment ?? 0),
                        dollarFormatter.format(row.consumption ?? 0),
                        dollarFormatter.format(row.demand ?? 0),
                        dollarFormatter.format(row.rebates ?? 0),
                        dollarFormatter.format(row.waterUse ?? 0),
                        dollarFormatter.format(row.waterDisposal ?? 0),
                        dollarFormatter.format(row.recurring ?? 0),
                        dollarFormatter.format(row.nonRecurring ?? 0),
                        dollarFormatter.format(row.replace ?? 0),
                        dollarFormatter.format(row.residualValue ?? 0),
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
        const project = yield* getProject(Defaults.PROJECT_ID);

        if (project === undefined) return;

        download(
            new Blob([JSON.stringify(builder.build(), null, 2)], { type: "application/json" }),
            `${project.name}-E3.json`,
            "application/json",
        );
    });
