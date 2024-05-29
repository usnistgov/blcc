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
