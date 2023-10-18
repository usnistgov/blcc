import { imported$ } from "../blcc-format/Import";
import { startWith, switchMap } from "rxjs";
import { model } from "../util/Util";
import { AnalysisType, DiscountingMethod, DollarMethod, Project, SocialCostOfGhgScenario } from "../blcc-format/Format";
import { Version } from "../blcc-format/Verison";
import { bind } from "@react-rxjs/core";

const defaultModel: Project = {
    version: Version.V1,
    name: "Unnamed Project",
    description: undefined,
    analyst: undefined,
    analysisType: AnalysisType.FEDERAL_FINANCED,
    purpose: undefined,
    dollarMethod: DollarMethod.CONSTANT,
    studyPeriod: 25,
    constructionPeriod: 0,
    discountingMethod: DiscountingMethod.END_OF_YEAR,
    realDiscountRate: 0.06,
    nominalDiscountRate: undefined,
    inflationRate: undefined,
    location: {
        country: "US",
        state: undefined,
        city: undefined,
        zipcode: undefined
    },
    alternatives: [],
    costs: [],
    ghg: {
        socialCostOfGhgScenario: SocialCostOfGhgScenario.SCC,
        emissionsRateScenario: undefined
    }
};

const model$ = imported$.pipe(
    startWith(defaultModel),
    model<Project, Project>({
        version: Version.V1,
        name: "Unnamed Project",
        description: undefined,
        analyst: undefined,
        analysisType: AnalysisType.FEDERAL_FINANCED,
        purpose: undefined,
        dollarMethod: DollarMethod.CONSTANT,
        studyPeriod: undefined,
        constructionPeriod: 0,
        discountingMethod: DiscountingMethod.END_OF_YEAR,
        alternatives: [],
        realDiscountRate: 0.06,
        nominalDiscountRate: undefined,
        inflationRate: undefined,
        ghg: {
            socialCostOfGhgScenario: SocialCostOfGhgScenario.SCC,
            emissionsRateScenario: undefined
        }
    })
);

const [useModel] = bind(model$, undefined);
export { useModel };

model$
    .pipe(
        switchMap((x) => x.alternatives$),
        switchMap((x) => x[0].name$)
    )
    .subscribe(console.log);

model$.pipe(switchMap((x) => x.json$)).subscribe(console.log);
