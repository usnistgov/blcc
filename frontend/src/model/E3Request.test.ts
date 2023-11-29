import { test } from "vitest";
import {
    AnalysisType,
    CostTypes,
    DiscountingMethod,
    DollarMethod,
    DollarOrPercent,
    Project
} from "../blcc-format/Format";
import { Version } from "../blcc-format/Verison";
import { of } from "rxjs";
import { toE3Object } from "./E3Request";
import { Country } from "../constants/LOCATION";

const project: Project = {
    version: Version.V1,
    name: "Test Project",
    analysisType: AnalysisType.FEDERAL_FINANCED,
    dollarMethod: DollarMethod.CONSTANT,
    studyPeriod: 25,
    constructionPeriod: 0,
    discountingMethod: DiscountingMethod.END_OF_YEAR,
    location: {
        country: Country.USA,
        state: undefined,
        city: undefined,
        zipcode: undefined
    },
    alternatives: [
        {
            id: 0,
            name: "Alternative 1",
            costs: [0],
            baseline: true
        }
    ],
    costs: [
        {
            id: 0,
            name: "Cost 1",
            type: CostTypes.CAPITAL,
            expectedLife: 25,
            initialCost: 100,
            phaseIn: [0.5, 0.3, 0.2],
            residualValue: {
                value: 0.1,
                approach: DollarOrPercent.PERCENT
            }
        }
    ],
    ghg: {
        emissionsRateScenario: undefined,
        socialCostOfGhgScenario: undefined
    }
};

test("Capital cost converter creates phase-in", async () => {
    of(project)
        .pipe(toE3Object())
        .subscribe((b) => console.log(b.build()));
});
