import Dexie, { Table } from "dexie";
import { Alternative, Cost, Project } from "../blcc-format/Format";

export class BlccDexie extends Dexie {
    projects!: Table<Project, number>;
    costs!: Table<Cost, number>;
    alternatives!: Table<Alternative, number>;

    constructor() {
        super("BlccDatabase");

        this.version(1).stores({
            projects: "++id, name",
            costs: "++id, name",
            alternatives: "++id, name, baseline"
        });
    }
}

export const db = new BlccDexie();
