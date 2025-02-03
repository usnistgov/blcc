import type { Output } from "@lrd/e3-sdk";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { Defaults } from "blcc-format/Defaults";
import type { AltResults, Annual, Summary } from "blcc-format/ExportTypes";
import Pdf from "components/Pdf";
import { Effect } from "effect";
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
import { createAlternativeNameMap, findBaselineID, groupOptionalByTag } from "util/Util";

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
    const project = yield* getProject(1); //FIXME This shouldn't really be a magic number

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

const createPdfBlob = (element: React.ReactElement<DocumentProps>) => Effect.tryPromise(() => pdf(element).toBlob());

const downloadCsv = Effect.gen(function* () {
    const project = yield* getProject(1);
    const alternatives = yield* getAlternatives;

    if (project === undefined) return;
});
