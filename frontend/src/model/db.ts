import type { Output } from "@lrd/e3-sdk";
import type { Alternative, Cost, Project } from "blcc-format/Format";
import Dexie, { type Table } from "dexie";

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
