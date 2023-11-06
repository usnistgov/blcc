import { imported$ } from "../blcc-format/Import";
import { scan } from "rxjs";
import { Alternative, AnalysisType, Cost, Project, DollarMethod } from "../blcc-format/Format";
import { mergeWithKey } from "@react-rxjs/utils";
import {
    analysisPurposeChange$,
    analysisTypeChange$,
    analystChange$,
    descriptionChange$,
    dollarMethodChange$,
    modifiedDollarMethod$,
    inflationChange$,
    nameChange$,
    nomDiscChange$,
    realDiscChange$,
    countryChange$,
    stateChange$,
    stateDDChange$,
    zipChange$,
    studyPeriodChange$,
    constructionPeriodChange$,
    discountingMethodChange$,
    emissionsRateChange$,
    socialCostChange$,
    combinedLocation$,
    combinedGHG$
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
    addAlternative$,
    dollarMethodChange$,
    modifiedDollarMethod$,
    inflationChange$,
    nomDiscChange$,
    realDiscChange$,
    countryChange$,
    stateChange$,
    stateDDChange$,
    zipChange$,
    studyPeriodChange$,
    constructionPeriodChange$,
    discountingMethodChange$,
    emissionsRateChange$,
    socialCostChange$,
    combinedLocation$,
    combinedGHG$
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
                case "modifiedDollarMethod$": {
                    accumulator.dollarMethod = operation.payload;
                    break;
                }
                case "inflationChange$": {
                    accumulator.inflationRate = operation.payload;
                    break;
                }
                case "nomDiscChange$": {
                    accumulator.nominalDiscountRate = operation.payload;
                    break;
                }
                case "realDiscChange$": {
                    accumulator.realDiscountRate = operation.payload;
                    break;
                }
                case "countryChange$": {
                    accumulator.country = operation.payload;
                    break;
                }
                case "studyPeriodChange$": {
                    accumulator.studyPeriod = operation.payload;
                    break;
                }
                case "constructionPeriodChange$": {
                    accumulator.constructionPeriod = operation.payload;
                    break;
                }
                case "discountingMethodChange$": {
                    accumulator.discountingMethod = operation.payload;
                    break;
                }
                case "emissionsRateChange$": {
                    accumulator.emissionsRateScenario = operation.payload;
                    break;
                }
                case "combinedLocation$": {
                    accumulator.location = operation.payload;
                    break;
                }
                case "combinedGHG$": {
                    accumulator.ghg = operation.payload;
                    break;
                }
            }

            return accumulator;
        },
        {
            name: "Untitled Project",
            analysisType: AnalysisType.FEDERAL_FINANCED,
            country: "United States of America",
            alternatives: [] as Alternative[],
            costs: [] as Cost[],
            location: undefined,
            dollarMethod: DollarMethod.CONSTANT
        } as Project
    ),
    shareLatest(),
    connectProject()
);

export { project$ };
