import { createSignal } from "@react-rxjs/utils";
import { iif, map, Observable, Subject, switchMap } from "rxjs";
import { convert } from "./Converter";
import { Project } from "./Format";
import { shareLatest } from "@react-rxjs/core";

const [uploadFile$, upload] = createSignal<FileList>();

const imported$: Observable<Project> = uploadFile$.pipe(
    map((files) => files[0]),
    switchMap((file) => {
        const result$ = new Subject<string>();

        const reader = new FileReader();
        reader.onload = function () {
            result$.next(this.result as string);
        };
        reader.readAsText(file);

        return iif(
            () => file.type === "text/xml",
            result$.pipe(convert()), //TODO: add validation and an error message on failure
            result$.pipe(map((text) => JSON.parse(text) as Project))
        );
    }),
    shareLatest()
);

export { imported$, upload };
