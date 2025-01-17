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

        this.version(5).stores({
            projects: "++id, name",
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
export const clearDB = Effect.andThen(deleteDB, openDB);
export const getProjectCount = Effect.promise(() => db.projects.count());
export const addProject = (project: Project) => Effect.promise(() => db.projects.add(project));
export const setHash = (project: Project, alternatives: Alternative[], costs: Cost[]) =>
    Effect.promise(() => db.dirty.add({ hash: objectHash({ project, alternatives, costs }) }));
export const getProject = (id: ID) => Effect.promise(() => db.projects.where("id").equals(id).first());
export const importProject = (file: File) => Effect.promise(() => db.import(file));
