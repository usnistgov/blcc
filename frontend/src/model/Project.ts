import { shareLatest } from "@react-rxjs/core";
import { mergeWithKey } from "@react-rxjs/utils";
import { scan } from "rxjs";
import { Alternative, AnalysisType, Cost, DiscountingMethod, DollarMethod, Project } from "../blcc-format/Format";
import { imported$ } from "../blcc-format/Import";
import { Version } from "../blcc-format/Verison";
import { modifiedAddAlternative$ } from "../components/AddAlternativeModal";
import { modifiedAddCost$ } from "../components/AddCostModal";
import { addAlternative$ } from "../components/Navigation";
import { Country } from "../constants/LOCATION";
import {
    modifiedbaselineChange$,
    modifiedcloneAlternative$,
    modifiedremoveAlternative$
} from "../pages/editor/Alternatives";
import {
    analysisPurposeChange$,
    analysisTypeChange$,
    analystChange$,
    combinedGHG$,
    combinedLocation$,
    constructionPeriodChange$,
    descriptionChange$,
    discountingMethodChange$,
    inflationChange$,
    modifiedDollarMethod$,
    nameChange$,
    nomDiscChange$,
    realDiscChange$,
    studyPeriodChange$
} from "../pages/editor/GeneralInformation";
import { connectProject } from "./Model";

const project$ = mergeWithKey({
    imported$,
    addAlternative$,

    // Default behavior
    name: nameChange$,
    description: descriptionChange$,
    analyst: analystChange$,
    analysisType: analysisTypeChange$,
    purpose: analysisPurposeChange$,
    dollarMethod: modifiedDollarMethod$,
    inflationRate: inflationChange$,
    nominalDiscountRate: nomDiscChange$,
    realDiscountRate: realDiscChange$,
    studyPeriod: studyPeriodChange$,
    constructionPeriod: constructionPeriodChange$,
    discountingMethod: discountingMethodChange$,
    location: combinedLocation$,
    ghg: combinedGHG$,
    baselineChange$: modifiedbaselineChange$,
    addAlternative2$: modifiedAddAlternative$,
    removeAlternative$: modifiedremoveAlternative$,
    cloneAlternative$: modifiedcloneAlternative$,
    addCost$: modifiedAddCost$
}).pipe(
    scan(
        (accumulator, operation) => {
            switch (operation.type) {
                case "imported$": {
                    return operation.payload;
                }
                case "addAlternative$": {
                    accumulator.alternatives.push(operation.payload);
                    break;
                }
                case "addAlternative2$": {
                    accumulator.alternatives.push(operation.payload);
                    break;
                }
                case "removeAlternative$": {
                    const [_, altId] = operation.payload;
                    const alts = accumulator.alternatives.filter((alt) => alt.id != altId);
                    accumulator.alternatives = alts;
                    break;
                }
                case "cloneAlternative$": {
                    const [id, altId] = [operation.payload.id, operation.payload.altId];
                    const a = accumulator.alternatives.find((alt) => alt.id == altId);
                    const clonedAlt = { ...a, id, name: `Clone of ${a.name}` };
                    accumulator.alternatives.push(clonedAlt);
                    break;
                }
                case "addCost$": {
                    const [name, alts] = operation.payload;
                    const ids = accumulator.costs.map((cost) => cost.id);
                    const newID = Math.max(...ids) + 1;
                    const cost = { id: newID, name: name[0][1], type: name[1] };
                    accumulator.costs.push(cost);
                    const array = [...alts];
                    accumulator.alternatives.map((alt) => {
                        if (array.indexOf(alt?.id) !== -1) {
                            alt.costs.push(newID);
                        }
                    });
                    break;
                }
                case "baselineChange$": {
                    const [val, altId] = operation.payload;
                    accumulator.alternatives.forEach((alt) => {
                        if (alt.id == altId) alt.baseline = val;
                        else alt.baseline = false;
                    });
                    break;
                }
                /*
                 * By default the operation type denotes the property in project object and is set to the payload.
                 */
                default: {
                    accumulator[operation.type] = operation.payload as never;
                    break;
                }
            }

            return accumulator;
        },
        {
            version: Version.V1,
            name: "Untitled Project",
            analysisType: AnalysisType.FEDERAL_FINANCED,
            dollarMethod: DollarMethod.CONSTANT,
            studyPeriod: 25,
            constructionPeriod: 0,
            discountingMethod: DiscountingMethod.END_OF_YEAR,
            alternatives: [] as Alternative[],
            costs: [] as Cost[],
            location: {
                country: Country.USA
            },
            ghg: {
                emissionsRateScenario: undefined,
                socialCostOfGhgScenario: undefined
            }
        } as Project
    ),
    shareLatest(),
    connectProject()
);

export { project$ };
