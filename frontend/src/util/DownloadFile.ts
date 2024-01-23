/**
 * Accepts a JSON object and a filename and converts it to a string and downloads the file.
 *
 * @param obj The JSON object to download.
 * @param filename The name for the file.
 */
export function download(obj: object, filename: string) {
    const blob = new Blob([JSON.stringify(obj)], { type: "text/json" });
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
    link.click();
}
