import { bind } from "@react-rxjs/core";
import { map, of, switchMap } from "rxjs";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";

// NEW

export const currentProject$ = of(1);

const dbProject$ = currentProject$.pipe(
    switchMap((currentID) => liveQuery(() => db.projects.where("id").equals(currentID).first())),
    guard()
);

export const name$ = dbProject$.pipe(map((p) => p.name));
export const [useName] = bind(name$, "");

export const analyst$ = dbProject$.pipe(map((p) => p.analyst));
export const [useAnalyst] = bind(analyst$, undefined);

export const description$ = dbProject$.pipe(map((p) => p.description));
export const [useDescription] = bind(description$, undefined);
