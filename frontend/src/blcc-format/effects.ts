import { defaultProject } from "blcc-format/DefaultProject";
import { fetchReleaseYears, jsonResponse } from "blcc-format/api";
import { decodeReleaseYear } from "blcc-format/schema";
import { Effect, Option } from "effect";
import { addProject, clearDB, getProjectCount } from "model/db";

export const getReleaseYears = Effect.gen(function* () {
    const request = yield* fetchReleaseYears;
    const json = yield* jsonResponse(request);
    return yield* decodeReleaseYear(json);
});

export const getDefaultReleaseYear = Effect.gen(function* () {
    const releaseYears = yield* getReleaseYears;

    if (releaseYears[0] === undefined) return 2023;

    return releaseYears[0].year;
});

export const resetToDefaultProject = Effect.gen(function* () {
    yield* Effect.log("Creating default project");

    // Delete the entire db if it exists just in case
    yield* clearDB;

    // Create a default project with the latest release year
    const defaultReleaseYear = yield* getDefaultReleaseYear;
    const project = defaultProject(defaultReleaseYear);
    yield* addProject(project);

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
