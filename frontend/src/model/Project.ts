import { imported$ } from "../blcc-format/Import";
import { scan } from "rxjs";
import { Alternative, AnalysisType, Cost, DiscountingMethod, DollarMethod, Project } from "../blcc-format/Format";
import { mergeWithKey } from "@react-rxjs/utils";
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
import { addAlternative$ } from "../components/Navigation";
import { shareLatest } from "@react-rxjs/core";
import { Version } from "../blcc-format/Verison";
import { Country } from "../constants/LOCATION";

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
    ghg: combinedGHG$
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
