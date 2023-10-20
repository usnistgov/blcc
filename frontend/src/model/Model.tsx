import { imported$ } from "../blcc-format/Import";
import { startWith, switchMap } from "rxjs";
import { model } from "../util/Util";
import { AnalysisType, DiscountingMethod, DollarMethod, Project, SocialCostOfGhgScenario } from "../blcc-format/Format";
import { Version } from "../blcc-format/Verison";
import { bind } from "@react-rxjs/core";

/**
 * Default values for a project.
 */
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

/**
 * Creates a converts an imported project into a project model for use in the gui.
 */
const project$ = imported$.pipe(startWith(defaultModel), model<Project, Project>(defaultModel));

const Model = {
    project$
};

export { Model };

type Hooks<T> = {
    [A in keyof T as `use${Capitalize<string & A>}`]: () => T[A];
};

/**
 * Creates a number of hooks for the properties in the main project model with the given defaults.
 *
 * @param defaults an object with the properties to create hooks for and their default value
 */
export function modelHooks<A extends object>(defaults: A): Hooks<A> {
    const result: any = {};

    Object.keys(defaults).forEach((property) => {
        const [use] = bind(project$.pipe(switchMap((p) => p[`${property}$`])), defaults[property]);
        result[`use${property.at(0)?.toUpperCase()}${property.slice(1, property.length)}`] = use;
    });

    return result;
}
