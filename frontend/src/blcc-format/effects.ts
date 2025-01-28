import { defaultProject } from "blcc-format/DefaultProject";
import { fetchReleaseYears } from "blcc-format/api";
import { Effect, Option } from "effect";
import { clearDB, deleteAndReopenDB, getProjectCount, setHash, setProject } from "model/db";

export const getDefaultReleaseYear = Effect.gen(function* () {
    const releaseYears = yield* fetchReleaseYears;

    if (releaseYears[0] === undefined) return 2023;

    return releaseYears[0].year;
});

export const resetToDefaultProject = Effect.gen(function* () {
    yield* Effect.log("Creating default project");

    // Clear the entire db
    yield* clearDB;

    // Create a default project with the latest release year
    const defaultReleaseYear = yield* getDefaultReleaseYear;
    const project = defaultProject(defaultReleaseYear);
    yield* setProject(project); // Add project to db
    yield* setHash(project, [], []); // Set hash for change detection

    return project;
});

export const checkDefaultProject = Effect.gen(function* () {
    // If there is more than 0 projects in the database we don't need to create a default
    const projectCount = yield* getProjectCount;
    yield* Effect.log(`Project count is ${projectCount}`);

    if (projectCount > 0) return Option.none();

    const defaultProject = yield* resetToDefaultProject;
    return Option.some(defaultProject);
});
