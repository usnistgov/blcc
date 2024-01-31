import { shareLatest } from "@react-rxjs/core";
import { mergeWithKey } from "@react-rxjs/utils";
import { scan } from "rxjs";
import {
    Alternative,
    AnalysisType,
    Cost,
    CostTypes,
    DiscountingMethod,
    DollarMethod,
    ID,
    Project
} from "../blcc-format/Format";
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
import { baseCostChange$ } from "../pages/editor/Cost";

export const project$ = mergeWithKey({
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
    alternativeNameChange$,
    baseCostChange$
}).pipe(
    scan(
        (accumulator, operation) => {
            switch (operation.type) {
                case "imported$":
                    return operation.payload;
                case "addAlternative$":
                    return addAlternative(accumulator, operation.payload);
                case "removeAlternative$":
                    return removeAlternative(accumulator, operation.payload);
                case "cloneAlternative$":
                    return cloneAlternative(accumulator, operation.payload);
                case "newCost$":
                    return newCost(accumulator, operation.payload);
                case "baselineChange$":
                    return changeBaseline(accumulator, operation.payload);
                case "alternativeNameChange$":
                    return changeAlternativeName(accumulator, operation.payload);
                case "baseCostChange$": {
                    const [id, x] = operation.payload;
                    const cost = accumulator.costs.get(id);

                    if (cost === undefined) return accumulator;

                    switch (x.type) {
                        case "alts": {
                            break;
                        }
                        default: {
                            cost[x.type] = x.payload as never;
                        }
                    }

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
            alternatives: new Map<ID, Alternative>(),
            costs: new Map<ID, Cost>(),
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

/**
 * A list of failed rules.
 */
export const ruleErrors$ = project$.pipe(
    map((project) => {
        return rules.map((rule) => rule(project)).filter((result) => !result.value);
    })
);

/**
 * A boolean denoting whether the project has any failed rules or not.
 */
export const isProjectValid$ = ruleErrors$.pipe(map((results) => results.length <= 0));

function addAlternative(project: Project, newAlternative: Alternative): Project {
    project.alternatives.set(newAlternative.id, newAlternative);
    return project;
}

/**
 * Removes the specific alternative from the project.
 */
function removeAlternative(project: Project, altToRemove: ID): Project {
    project.alternatives.delete(altToRemove);
    return project;
}

/**
 * Clones the specified alternative.
 */
function cloneAlternative(project: Project, altToClone: ID): Project {
    const alt = project.alternatives.get(altToClone);
    const clonedAlt = {
        ...alt,
        id: getNewID([...project.alternatives.keys()]),
        name: `Clone of ${alt?.name}`
    } as Alternative;
    project.alternatives.set(clonedAlt.id, clonedAlt);

    return project;
}

/**
 * Adds a new cost to the specified alternatives.
 */
function newCost(project: Project, [name, type, alts]: [string, CostTypes, ID[]]): Project {
    // Create new Cost
    const id = getNewID([...project.costs.keys()]);
    project.costs.set(id, { id, name, type } as Cost);

    // Add cost to checked alternatives
    const altSet = new Set(alts);
    project.alternatives.forEach((alt) => {
        if (altSet.has(alt.id)) {
            alt.costs.push(id);
        }
    });

    return project;
}

/**
 * Sets the specific alternative to be the baseline. Any other baseline alternatives will be set to false.
 */
function changeBaseline(project: Project, [val, altID]: [boolean, ID]): Project {
    project.alternatives.forEach((alt) => {
        if (alt.id == altID) alt.baseline = val;
        else alt.baseline = false;
    });
    return project;
}

/**
 * Changes the name of the specified alternative.
 */
function changeAlternativeName(project: Project, [newName, id]: [string, ID]): Project {
    const alternative = project.alternatives.get(id);

    if (alternative === undefined) return project;

    alternative.name = newName;
    return project;
}
