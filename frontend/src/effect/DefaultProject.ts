import { Defaults } from "blcc-format/Defaults";
import { Case, DollarMethod, EmissionsRateType, GhgDataSource, type Project } from "blcc-format/Format";
import { Version } from "blcc-format/Verison";
import { fetchReleaseYears } from "blcc-format/api";
import { Country } from "constants/LOCATION";
import { Effect } from "effect";
import { DexieService } from "model/db";

/**
 * Creates a project object with default values given a release year.
 * @param releaseYear The release year of the data to use for this project.
 */
export function createDefaultProject(releaseYear: number): Project {
    return {
        id: Defaults.PROJECT_ID,
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
        },
        releaseYear,
    };
}

/**
 * Get the default release year in order to generate the default project.
 */
export const getDefaultReleaseYear = Effect.gen(function* () {
    const releaseYears = yield* fetchReleaseYears;
    if (releaseYears[0] === undefined) return Defaults.RELEASE_YEAR;
    return releaseYears[0].year;
});

/**
 * Create a default project, insert into database, and return as an object.
 */
export const resetToDefaultProject = Effect.gen(function* () {
    const db = yield* DexieService;
    yield* Effect.log("Creating default project");

    // Clear the entire db
    yield* db.clearDB;

    // Create a default project with the latest release year
    const defaultReleaseYear = yield* getDefaultReleaseYear;
    const project = createDefaultProject(defaultReleaseYear);

    yield* db.setProject(project); // Add project to db
    yield* db.hashCurrent.pipe(Effect.andThen(db.setHash));

    return project;
});
