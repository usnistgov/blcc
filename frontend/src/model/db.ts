import Dexie, { Table } from "dexie";
import { Purpose } from "../blcc-format/Format";

type Project = {
    id?: number;
    name: string;
    purpose?: Purpose;
};

export class BlccDexie extends Dexie {
    projects!: Table<Project>;

    constructor() {
        super("BlccDatabase");

        this.version(1).stores({
            projects: "++id, name"
        });
    }
}

export const db = new BlccDexie();
