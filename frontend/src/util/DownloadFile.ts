import { Effect } from "effect";
import { exportDB, getProject, hashCurrent } from "model/db";

/**
 * Accepts a JSON object and a filename and converts it to a string and downloads the file.
 *
 * @param blob The blob to download
 * @param filename The name for the file.
 */
export function download(blob: Blob, filename: string) {
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
    link.click();
}

/**
 * An effect that downloads a file and sets the dirty check hash to be the hash of the current project.
 */
export const downloadBlccFile = Effect.gen(function* () {
    const project = yield* getProject(1);

    if (project === undefined) return;

    yield* hashCurrent;
    const blob = yield* exportDB;
    download(blob, `${project.name}.blcc`);
});
