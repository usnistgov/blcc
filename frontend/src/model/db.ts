import type { Output } from "@lrd/e3-sdk";
import type { Alternative, Cost, ID, Project } from "blcc-format/Format";
import Dexie, { type Table } from "dexie";
import { Effect } from "effect";
import objectHash from "object-hash";

/**
 * Class describing the Dexie database tables.
 */
export class BlccDexie extends Dexie {
    projects!: Table<Project, number>;
    costs!: Table<Cost, number>;
    alternatives!: Table<Alternative, number>;
    results!: Table<Output & { hash: string; timestamp: Date }, string>;
    errors!: Table<{ id: string; url: string; messages: string[] }, string>;
    dirty!: Table<{ hash: string }, string>;

    constructor() {
        super("BlccDatabase");

        this.version(6).stores({
            projects: "&id",
            costs: "++id, name, type",
            alternatives: "++id, name, baseline",
            results: "&hash",
            errors: "&id",
            dirty: "&hash",
        });
    }
}

/**
 * The global BLCC database instance
 */
export const db = new BlccDexie();

export const deleteDB = Effect.promise(() => db.delete());
export const openDB = Effect.promise(() => db.open());
export const exportDB = Effect.promise(() => db.export());

export const clearProject = Effect.promise(() => db.projects.clear());
export const clearCosts = Effect.promise(() => db.costs.clear());
export const clearAlternatives = Effect.promise(() => db.alternatives.clear());
export const clearErrors = Effect.promise(() => db.errors.clear());
export const clearDirty = Effect.promise(() => db.dirty.clear());

export const clearDB = Effect.gen(function* () {
    yield* clearProject;
    yield* clearCosts;
    yield* clearAlternatives;
    yield* clearResults;
    yield* clearErrors;
    yield* clearDirty;
});

export const deleteAndReopenDB = Effect.andThen(deleteDB, openDB);

export const getProjectCount = Effect.promise(() => db.projects.count());
export const setProject = (project: Project) => Effect.promise(() => db.projects.put({ ...project, id: 1 }));
export const setHash = (project: Project, alternatives: Alternative[], costs: Cost[]) =>
    Effect.promise(() => db.dirty.add({ hash: objectHash({ project, alternatives, costs }) }));
export const getProject = (id: ID) => Effect.promise(() => db.projects.where("id").equals(id).first());
export const getAlternatives = Effect.promise(() => db.alternatives.toArray());
export const getCosts = Effect.promise(() => db.costs.toArray());
export const importProject = (file: File) => Effect.promise(() => db.import(file));
export const clearHash = Effect.promise(() => db.dirty.clear());

/*
 * Results
 */
export const getResults = Effect.promise(() => db.results.toArray());
export const clearResults = Effect.promise(() => db.results.clear());
export const removeResult = (hash: string) => Effect.promise(() => db.results.delete(hash));
export const addResult = (hash: string, timestamp: Date, result: Output) =>
    Effect.promise(() => db.results.add({ hash, timestamp, ...result }));

export const hashCurrent = Effect.gen(function* () {
    const project = yield* getProject(1);

    if (project === undefined) return;

    const alternatives = yield* getAlternatives;
    const costs = yield* getCosts;

    return objectHash({ project, alternatives, costs });
});

export const hashCurrentAndSet = Effect.gen(function* () {
    const project = yield* getProject(1);

    if (project === undefined) return;

    const alternatives = yield* getAlternatives;
    const costs = yield* getCosts;

    yield* clearHash;
    yield* setHash(project, alternatives, costs);
});
