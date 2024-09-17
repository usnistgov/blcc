import {
    Case,
    DollarMethod,
    EmissionsRateType,
    GhgDataSource,
    type Project,
    SocialCostOfGhgScenario,
} from "blcc-format/Format";
import { Version } from "blcc-format/Verison";
import { Country } from "constants/LOCATION";

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
        case: Case.REF,
        alternatives: [],
        costs: [],
        ghg: {
            dataSource: GhgDataSource.NIST_NETL,
            emissionsRateType: EmissionsRateType.AVERAGE,
            socialCostOfGhgScenario: SocialCostOfGhgScenario.NONE,
        },
        releaseYear,
    };
}
