import { map, Observable, pipe, UnaryFunction } from "rxjs";
import { AnalysisType, DiscountingMethod, DollarMethod, Project } from "./Format";
import { Version } from "./Verison";

function createNewProject(): UnaryFunction<Observable<[string, AnalysisType]>, Observable<Project>> {
    return pipe(
        map(([name, analysisType]): Project => {
            return {
                version: Version.V1,
                name,
                description: undefined,
                analyst: undefined,
                analysisType,
                purpose: undefined,
                dollarMethod: DollarMethod.CONSTANT,
                studyPeriod: 25,
                discountingMethod: DiscountingMethod.END_OF_YEAR,
                realDiscountRate: undefined, //TODO, fill with default data
                nominalDiscountRate: undefined,
                inflationRate: undefined,
                location: undefined,
                alternatives: [],
                costs: [],
                ghg: {
                    emissionsRateScenario: undefined,
                    socialCostOfGhgScenario: undefined
                }
            };
        })
    );
}
