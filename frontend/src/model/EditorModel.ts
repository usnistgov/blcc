import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { filter, map, merge, Subject, tap, withLatestFrom } from "rxjs";
import { hash$, isDirty$, Model } from "./Model";
import { db } from "./db";
import { download } from "blcc-format/DownloadFile";
import saveDiscardModal from "components/modal/SaveDiscardModal";
import { sampleMany } from "util/Operators";

export namespace EditorModel {

    /* Save button Section */

    // Stream that represents with the "save" button has been clicked
    export const saveClick$ = new Subject<void>();

    // Stream that represents if the "cancel" button on the save modal has been clicked
    export const [cancelSaveInput$, cancelSave] = createSignal();

    // True if "Save" modal should be open, False if it should be closed
    export const [useOpenSave, openSave$] = bind(merge(
        saveClick$.pipe(map(() => true)), 
        cancelSaveInput$.pipe(map(() => false
    ))), false);

    // Stream of name to use when saving a file
    export const [saveAsInput$, saveAsInput] = createSignal<string>();

    // Hook to use for name for saved file (defaults to "")
    export const [useSaveAsInput] = bind(saveAsInput$, ""); 

    // Whether save button on save modal should be disabled (true if name is empty, and should be disabled)
    export const [useDisabledSaveInput, disabledSaveInput$] = bind(saveAsInput$.pipe(map((name) => name === "" || name === undefined)), true);

    // Defaults save file name to project name when modal is opened
    openSave$.pipe(withLatestFrom(Model.name.$)).subscribe(([, name]) => saveAsInput(name ?? ""));

    
    /* New/Open Button Section */

    
    export const [newClick$, newClick] = createSignal<void>();
    export const openClick$ = new Subject<void>();
    

    // Click streams mapped to their respective actions
    const newOpen$ = merge(newClick$.pipe(map(() => OpenDiscard.NEW)), openClick$.pipe(map(() => OpenDiscard.OPEN)));

    // Actions that can open the confirmation dialog
    enum OpenDiscard {
        NEW = 0,
        OPEN = 1,
    }
    
    // Create the confirmation dialog. Only opens if the current project is dirty.
    export const {
        component: SaveDiscardModal,
        saveClick$: modalSaveClick$,
        discardClick$,
    } = saveDiscardModal<OpenDiscard>(
        newOpen$.pipe(
            withLatestFrom(isDirty$),
            filter(([, dirty]) => dirty),
            map(([value]) => value),
        ),
    );
    
    /*
     * Performs a save when the save button on the confirmation modal is clicked.
     * Outputs the save action.
     */
    const confirmSave$ = modalSaveClick$.pipe(
        withLatestFrom(hash$),
        tap(async ([, hash]) => await save(hash, "download.blcc")),
        map(([action]) => action),
    );
    
    /*
     * Stream that represents when new project should be created. Either when the new button
     * is clicked and the current project is not dirty, or when the discard button is clicked
     * on the confirmation dialog, or when the confirmation dialog executes a save.
     */
    export const new$ = merge(
        sampleMany(newClick$, [isDirty$]).pipe(filter(([dirty]) => !dirty)),
        merge(discardClick$, confirmSave$).pipe(filter((action) => action === OpenDiscard.NEW)),
    );
    
    /*
     * Stream that represents when project should be opened. Either when the open button is
     * clicked and the current project is not dirty, or when the discard button is clicked on
     * the confirmation dialog, or when the confirmation dialog executes a save.
     */
    export const open$ = merge(
        sampleMany(openClick$, [isDirty$]).pipe(filter(([dirty]) => !dirty)),
        merge(discardClick$, confirmSave$).pipe(filter((action) => action === OpenDiscard.OPEN)),
    );
    
    // Saves the current project and saves the hash for dirty detection.
    async function save(hash: string, filename: string) {
        await db.dirty.clear();
        await db.dirty.add({ hash });
        download(await db.export(), filename, "application/json");
    }

}