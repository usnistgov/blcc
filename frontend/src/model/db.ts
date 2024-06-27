import type { Output } from "@lrd/e3-sdk";
import type { Alternative, Cost, Project } from "blcc-format/Format";
import Dexie, { type Table } from "dexie";

export class BlccDexie extends Dexie {
    projects!: Table<Project, number>;
    costs!: Table<Cost, number>;
    alternatives!: Table<Alternative, number>;
    results!: Table<Output & { hash: string }, string>;
    errors!: Table<{ id: string; url: string; messages: string[] }, string>;
    dirty!: Table<{ hash: string }, string>;

    constructor() {
        super("BlccDatabase");

        this.version(1).stores({
            projects: "++id, name",
            costs: "++id, name",
            alternatives: "++id, name, baseline",
            results: "&hash",
            errors: "&id",
            dirty: "&hash",
        });
    }
}

export const db = new BlccDexie();
