import { createSignal } from "@react-rxjs/utils";
import { iif, map, Observable, Subject, switchMap } from "rxjs";
import { convert } from "./Converter";
import { Project } from "./Format";
import { shareLatest } from "@react-rxjs/core";

/**
 * A signal representing the uploaded file from a file upload input element.
 */
const [uploadFile$, upload] = createSignal<FileList>();

export { upload };

/**
 * A stream representing the uploaded JSON object, either converted from the old format or just imported with the
 * new format.
 */
export const imported$: Observable<Project> = uploadFile$.pipe(
    map((files) => files[0]),
    switchMap((file) => {
        const result$ = new Subject<string>();

        // Read file
        const reader = new FileReader();
        reader.onload = function () {
            result$.next(this.result as string);
        };
        reader.readAsText(file);

        // Convert or parse JSON
        return iif(
            () => file.type === "text/xml",
            result$.pipe(convert()), //TODO: add validation and an error message on failure
            result$.pipe(map((text) => JSON.parse(text) as Project))
        );
    }),
    shareLatest()
);
