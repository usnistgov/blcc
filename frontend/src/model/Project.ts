import { imported$ } from "../blcc-format/Import";
import { scan } from "rxjs";
import { Alternative, AnalysisType, Cost, Project } from "../blcc-format/Format";
import { mergeWithKey } from "@react-rxjs/utils";
import {
    analysisPurposeChange$,
    analysisTypeChange$,
    analystChange$,
    descriptionChange$,
    nameChange$
} from "../pages/editor/GeneralInformation";
import { connectProject } from "./Model";
import { addAlternative$ } from "../components/Navigation";
import { shareLatest } from "@react-rxjs/core";

const project$ = mergeWithKey({
    imported$,
    nameChange$,
    descriptionChange$,
    analystChange$,
    analysisTypeChange$,
    analysisPurposeChange$,
    addAlternative$
}).pipe(
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
                case "analysisTypeChange$": {
                    accumulator.analysisType = operation.payload;
                    break;
                }
                case "analysisPurposeChange$": {
                    accumulator.purpose = operation.payload;
                    break;
                }
                case "addAlternative$": {
                    accumulator.alternatives.push(operation.payload);
                    break;
                }
            }

            return accumulator;
        },
        {
            name: "Untitled Project",
            analysisType: AnalysisType.FEDERAL_FINANCED,
            alternatives: [] as Alternative[],
            costs: [] as Cost[]
        } as Project
    ),
    shareLatest(),
    connectProject()
);

export { project$ };
