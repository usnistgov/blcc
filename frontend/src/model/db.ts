import Dexie, { Table } from "dexie";
import { Alternative, Cost, Project } from "../blcc-format/Format";
import { Output } from "e3-sdk";

export class BlccDexie extends Dexie {
    projects!: Table<Project, number>;
    costs!: Table<Cost, number>;
    alternatives!: Table<Alternative, number>;
    results!: Table<Output & { hash: string }, string>;
    errors!: Table<{ id: string }>;

    constructor() {
        super("BlccDatabase");

        this.version(1).stores({
            projects: "++id, name",
            costs: "++id, name",
            alternatives: "++id, name, baseline",
            results: "&hash",
            errors: "&id"
        });
    }
}

export const db = new BlccDexie();
