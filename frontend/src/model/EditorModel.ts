import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { map, merge, Subject, withLatestFrom } from "rxjs";
import { Model } from "./Model";

export namespace EditorModel {

    export const saveAsClick$ = new Subject<void>();

    export const [cancel$, cancel] = createSignal();
    export const [useOpen, open$] = bind(merge(
        saveAsClick$.pipe(map(() => true)), 
        cancel$.pipe(map(() => false
    ))), false);
    export const [saveAsInput$, saveAsInput] = createSignal<string>();
    export const [useSaveAsInput] = bind(saveAsInput$, ""); 
    export const [useDisabled, disabled$] = bind(saveAsInput$.pipe(map((name) => name === "" || name === undefined)), true);

    open$.pipe(withLatestFrom(Model.name.$)).subscribe(([, name]) => saveAsInput(name ?? ""));
}