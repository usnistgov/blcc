import { createSignal } from "@react-rxjs/utils";
import { Subject } from "rxjs";

export namespace EditorModel {
    /* Save button Section */

    // Stream that represents with the "save" button has been clicked
    export const [saveClick$, saveClick] = createSignal();

    /* New/Open Button Section */
    export const [newClick$, newClick] = createSignal<void>();
    export const openClick$ = new Subject<void>();
}
