import { createSignal, mergeWithKey } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";
import { imported$ } from "../blcc-format/Import";
import { map, merge, of, scan, startWith, switchMap } from "rxjs";
import { createModel, Model as ModelType } from "../util/Util";

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

type ProjectModel = {
    name: string;
};

const Model: ModelType<ProjectModel> = createModel({
    name: imported$.pipe(
        map((project) => project.name),
        startWith("Unnamed Project")
    )
});

/*imported$.subscribe((imported) => {
    Object.keys(imported).map((key) => {
        if (Object.hasOwn(Model, key)) {
            Model[key] = imported[key];
        }
    });

    //Model.name = imported.name;
});*/

/*
const [useProjectName] = bind(project$.pipe(map((x) => x.name)), "Unnamed Project");

const Model = {
    project$,
    projectName$,
    setProjectName,
    useProjectName
};
*/

export default Model;
