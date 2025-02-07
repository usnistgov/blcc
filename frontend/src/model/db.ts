import type { Output } from "@lrd/e3-sdk";
import { Defaults } from "blcc-format/Defaults";
import type { Alternative, Cost, ID, Project } from "blcc-format/Format";
import Dexie, { type Table } from "dexie";
import { Context, Data, Effect } from "effect";
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

export class DexieError extends Data.TaggedError("DexieError") {}

export class UndefinedError extends Data.TaggedError("UndefinedError")<{
    message: string;
}> {}

export class DexieService extends Effect.Service<DexieService>()("DexieService", {
    effect: Effect.gen(function* () {
        const clearProject = Effect.tryPromise({ try: () => db.projects.clear(), catch: () => new DexieError() });
        const clearCosts = Effect.tryPromise({ try: () => db.costs.clear(), catch: () => new DexieError() });
        const clearAlternatives = Effect.tryPromise({
            try: () => db.alternatives.clear(),
            catch: () => new DexieError(),
        });
        const clearErrors = Effect.tryPromise({ try: () => db.errors.clear(), catch: () => new DexieError() });
        const clearDirty = Effect.tryPromise({ try: () => db.dirty.clear(), catch: () => new DexieError() });
        const clearResults = Effect.tryPromise({ try: () => db.results.clear(), catch: () => new DexieError() });
        const clearHash = Effect.tryPromise({ try: () => db.dirty.clear(), catch: () => new DexieError() });

        const getProject = (id: ID = Defaults.PROJECT_ID) =>
            Effect.gen(function* () {
                const project = yield* Effect.tryPromise({
                    try: () => db.projects.get(id),
                    catch: () => new DexieError(),
                });

                if (project === undefined)
                    return yield* new UndefinedError({ message: `Could not find project with ID ${id}` });

                return project;
            });
        const getAlternatives = Effect.tryPromise({
            try: () => db.alternatives.toArray(),
            catch: () => new DexieError(),
        });
        const getCosts = Effect.tryPromise({ try: () => db.costs.toArray(), catch: () => new DexieError() });

        return {
            /*
             * Project table
             */
            getProject,
            setProject: (project: Project) =>
                Effect.tryPromise({
                    try: () => db.projects.put(project),
                    catch: () => new DexieError(),
                }),
            clearProject,

            /*
             * Costs
             */
            clearCosts,
            getCosts: Effect.tryPromise({ try: () => db.costs.toArray(), catch: () => new DexieError() }),
            setCosts: (costs: Cost[]) =>
                Effect.tryPromise({
                    try: () => db.costs.bulkPut(costs),
                    catch: () => new DexieError(),
                }),

            /*
             * Alternatives
             */
            clearAlternatives,
            getAlternatives: Effect.tryPromise({ try: () => db.alternatives.toArray(), catch: () => new DexieError() }),
            setAlternatives: (alternatives: Alternative[]) =>
                Effect.tryPromise({
                    try: () => db.alternatives.bulkPut(alternatives),
                    catch: () => new DexieError(),
                }),

            /*
             * Errors
             */
            clearErrors,

            /*
             * Dirty
             */
            clearDirty,
            hashCurrent: Effect.gen(function* () {
                const project = yield* getProject();

                const alternatives = yield* getAlternatives;
                const costs = yield* getCosts;

                return objectHash({ project, alternatives, costs });
            }),
            setHash: (hash: string) =>
                Effect.gen(function* () {
                    yield* clearDirty;
                    yield* Effect.tryPromise({ try: () => db.dirty.add({ hash }), catch: () => new DexieError() });
                }),

            /*
             * Results
             */
            clearResults,
            getResults: Effect.tryPromise({ try: () => db.results.toArray(), catch: () => new DexieError() }),
            addResult: (hash: string, timestamp: Date, result: Output) =>
                Effect.tryPromise({
                    try: () => db.results.add({ hash, timestamp, ...result }),
                    catch: () => new DexieError(),
                }),

            /*
             * Other
             */
            clearDB: Effect.gen(function* () {
                yield* clearProject;
                yield* clearCosts;
                yield* clearAlternatives;
                yield* clearResults;
                yield* clearErrors;
                yield* clearDirty;
            }),
            importProject: (file: File) =>
                Effect.tryPromise({ try: () => db.import(file), catch: () => new DexieError() }),
            exportDB: Effect.tryPromise({ try: () => db.export(), catch: () => new DexieError() }),
        };
    }),
}) {}
