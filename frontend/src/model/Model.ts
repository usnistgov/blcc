import { imported$ } from "../blcc-format/Import";
import { combineLatest, forkJoin, map, of } from "rxjs";
import { createModel, createTopLevelModel, Model as ModelType, modelProperty } from "../util/Util";
import {
    Alternative,
    AnalysisType,
    CapitalCost,
    Cost,
    CostTypes,
    DiscountingMethod,
    DollarMethod,
    GHG,
    Location,
    NonUSLocation,
    Purpose,
    USLocation
} from "../blcc-format/Format";
import { Version } from "../blcc-format/Verison";

type ProjectModel = {
    name: string;
    description?: string;
    analyst?: string;
    analysisType: AnalysisType;
    purpose?: Purpose; // For use with OMB_NON_ENERGY
    dollarMethod: DollarMethod;
    studyPeriod: number;
    constructionPeriod: number;
    discountingMethod: DiscountingMethod;
    realDiscountRate?: number;
    nominalDiscountRate?: number;
    inflationRate?: number;
    location: ModelType<Location>;
    alternatives: ModelType<Alternative>[];
    costs: ModelType<Cost>[];
    ghg: ModelType<GHG>;
};

type TestType = {
    name: string;
    realDiscountRate: number | undefined;
};

const testModel: ModelType<TestType> = createTopLevelModel(imported$, {
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
    realDiscountRate: 0.06,
    nominalDiscountRate: undefined,
    inflationRate: undefined
});

testModel.name$.subscribe(console.log);

combineLatest({
    name: testModel.name$,
    realDiscountRate: testModel.realDiscountRate$
})
    .pipe(map((value) => JSON.stringify(value)))
    .subscribe(console.log);

export { testModel };

const Model: ModelType<ProjectModel> = createModel({
    name: imported$.pipe(modelProperty((project) => project.name, "Unnamed Project")),
    description: imported$.pipe(modelProperty((project) => project.description)),
    analyst: imported$.pipe(modelProperty((project) => project.analyst)),
    analysisType: imported$.pipe(modelProperty((project) => project.analysisType, AnalysisType.FEDERAL_FINANCED)),
    purpose: imported$.pipe(modelProperty((project) => project.purpose)),
    dollarMethod: imported$.pipe(modelProperty((project) => project.dollarMethod, DollarMethod.CONSTANT)),
    constructionPeriod: imported$.pipe(modelProperty((project) => project.constructionPeriod, 0)),
    discountingMethod: imported$.pipe(
        modelProperty((project) => project.discountingMethod, DiscountingMethod.END_OF_YEAR)
    ),
    realDiscountRate: imported$.pipe(modelProperty((project) => project.realDiscountRate, 0.06)),
    nominalDiscountRate: imported$.pipe(modelProperty((project) => project.nominalDiscountRate)),
    inflationRate: imported$.pipe(modelProperty((project) => project.inflationRate)),
    location: imported$.pipe(modelProperty((project) => locationModel(project.location))),
    alternatives: imported$.pipe(modelProperty((project) => project.alternatives.map(altModel), [])),
    costs: imported$.pipe(modelProperty((project) => project.costs.map(costModel), [])),
    ghg: imported$.pipe(modelProperty((project) => ghgModel(project.ghg)))
});

function ghgModel(ghg: GHG): ModelType<GHG> {
    return createModel({
        emissionsRateScenario: of(ghg.emissionsRateScenario),
        socialCostOfGhgScenario: of(ghg.socialCostOfGhgScenario)
    });
}

function costModel(cost: Cost) {
    switch (cost.type) {
        case CostTypes.CAPITAL: {
            const capitalCost = cost as CapitalCost;
            return createModel({
                initialCost: of(capitalCost.initialCost),
                amountFinanced: of(capitalCost.amountFinanced),
                annualRateOfChange: of(capitalCost.annualRateOfChange),
                expectedLife: of(capitalCost.expectedLife),
                costAdjustment: of(capitalCost.costAdjustment),
                phaseIn: of(capitalCost.phaseIn),
                residualValue: of(capitalCost.residualValue)
            });
        }
        case CostTypes.ENERGY: {
        }
        case CostTypes.WATER: {
        }
        case CostTypes.REPLACEMENT_CAPITAL: {
        }
        case CostTypes.OMR: {
        }
        case CostTypes.IMPLEMENTATION_CONTRACT: {
        }
        case CostTypes.RECURRING_CONTRACT: {
        }
        case CostTypes.OTHER: {
        }
        case CostTypes.OTHER_NON_MONETARY: {
        }
    }
}

function altModel(alt: Alternative): ModelType<Alternative> {
    return createModel({
        id: of(alt.id),
        name: of(alt.name),
        description: of(alt.description),
        baseline: of(alt.baseline),
        costs: of(alt.costs)
    });
}

function locationModel(location: Location): ModelType<Location> {
    switch (location.country) {
        case "US": {
            const usLocation = location as USLocation;
            return createModel({
                country: of("US"),
                state: of(usLocation.state),
                city: of(usLocation.city),
                zipcode: of(usLocation.zipcode)
            });
        }
        default: {
            const otherLocation = location as NonUSLocation;
            return createModel({
                country: of(otherLocation.country),
                stateProvince: of(otherLocation.stateProvince),
                city: of(otherLocation.city)
            });
        }
    }
}

export default Model;
