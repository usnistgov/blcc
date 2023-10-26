import { imported$ } from "../blcc-format/Import";
import { scan } from "rxjs";
import { Project } from "../blcc-format/Format";
import { mergeWithKey } from "@react-rxjs/utils";
import { analystChange$, descriptionChange$, nameChange$ } from "../pages/editor/GeneralInformation";
import { connectProject } from "./Model";

const project$ = mergeWithKey({ imported$, nameChange$, descriptionChange$, analystChange$ }).pipe(
    scan(
        (accumulator, operation) => {
            switch (operation.type) {
                case "imported$": {
                    return operation.payload;
                }
                case "nameChange$": {
                    accumulator.name = operation.payload;
                    break;
                }
                case "descriptionChange$": {
                    accumulator.description = operation.payload;
                    break;
                }
                case "analystChange$": {
                    accumulator.analyst = operation.payload;
                    break;
                }
            }

            return accumulator;
        },
        {
            name: "Untitled Project"
        } as Project
    ),
    connectProject()
);

export { project$ };
