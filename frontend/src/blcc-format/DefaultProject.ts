import { Country } from "constants/LOCATION";
import { DollarMethod, EmissionsRateScenario, type Project, SocialCostOfGhgScenario } from "./Format";
import { Version } from "./Verison";

/**
 * Creates a project object with default values given a release year.
 * @param releaseYear The release year of the data to use for this project.
 */
export function defaultProject(releaseYear: number): Project {
    return {
        version: Version.V1,
        name: "Untitled Project",
        dollarMethod: DollarMethod.CONSTANT,
        constructionPeriod: 0,
        location: {
            country: Country.USA,
        },
        alternatives: [],
        costs: [],
        ghg: {
            socialCostOfGhgScenario: SocialCostOfGhgScenario.SCC,
            emissionsRateScenario: EmissionsRateScenario.BASELINE,
        },
        releaseYear,
    };
}
