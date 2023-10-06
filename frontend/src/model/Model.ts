import { createSignal, mergeWithKey } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { imported$ } from "../blcc-format/Import";
import { map, scan, startWith, switchMap } from "rxjs";

const [projectName$, setProjectName] = createSignal<string>();

const project$ = imported$.pipe(
    switchMap((importedProject) => {
        return mergeWithKey({
            name: projectName$
        }).pipe(
            scan((project, event) => {
                switch (event.type) {
                    case "name":
                        project["name"] = event.payload;
                        return project;
                }
            }, importedProject),
            startWith(importedProject)
        );
    })
);

const [useProjectName] = bind(project$.pipe(map((x) => x.name)), "Unnamed Project");

const Model = {
    project$,
    projectName$,
    setProjectName,
    useProjectName
};

export default Model;
