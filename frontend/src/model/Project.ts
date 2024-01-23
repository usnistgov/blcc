import { shareLatest } from "@react-rxjs/core";
import { mergeWithKey } from "@react-rxjs/utils";
import { scan } from "rxjs";
import { Alternative, AnalysisType, Cost, DiscountingMethod, DollarMethod, Project } from "../blcc-format/Format";
import { imported$ } from "../blcc-format/Import";
import { Version } from "../blcc-format/Verison";
import { newCost$ } from "../components/AddCostModal";
import { Country } from "../constants/LOCATION";
import {
    alternativeNameChange$,
    cloneAlternative$,
    modifiedBaselineChange$,
    removeAlternative$
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
import { getNewID } from "../util/Util";
import { map } from "rxjs/operators";
import { rules } from "./rules/Rules";
import { addAlternative$ } from "../components/AddAlternativeModal";

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
    baselineChange$: modifiedBaselineChange$,
    removeAlternative$,
    cloneAlternative$,
    newCost$,
    alternativeNameChange$
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
                case "removeAlternative$": {
                    accumulator.alternatives = accumulator.alternatives.filter((alt) => alt.id != operation.payload);
                    break;
                }
                case "cloneAlternative$": {
                    const alt = accumulator.alternatives.find((alt) => alt.id == operation.payload);
                    const clonedAlt = {
                        ...alt,
                        id: getNewID(accumulator.alternatives),
                        name: `Clone of ${alt?.name}`
                    } as Alternative;
                    accumulator.alternatives.push(clonedAlt);
                    break;
                }
                case "newCost$": {
                    const [name, type, alts] = operation.payload;

                    // Create new Cost
                    const id = getNewID(accumulator.costs);
                    accumulator.costs.push({ id, name, type } as Cost);

                    // Add cost to checked alternatives
                    const altSet = new Set(alts);
                    accumulator.alternatives.forEach((alt) => {
                        if (altSet.has(alt.id)) {
                            alt.costs.push(id);
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
                case "alternativeNameChange$": {
                    const [newName, id] = operation.payload;
                    const alternative = accumulator.alternatives.find((alt) => alt.id === id);

                    if (alternative === undefined) return accumulator;

                    alternative.name = newName;
                    return accumulator;
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

export const ruleErrors$ = project$.pipe(
    map((project) => {
        return rules.map((rule) => rule(project)).filter((result) => !result.value);
    })
);

export const isProjectValid$ = ruleErrors$.pipe(map((results) => results.length <= 0));

export { project$ };
