import { mdiClose, mdiDownload, mdiFileDocumentPlus } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Modal from "antd/es/modal/Modal";
import { Button, ButtonType } from "components/input/Button";
import { isDirty$ } from "model/Model";
import { type OperatorFunction, map, merge, of, pipe, switchMap, take } from "rxjs";
import { withLatestFrom } from "rxjs/operators";

export function showSaveDiscard(onSave: OperatorFunction<unknown, void>): OperatorFunction<unknown, void> {
    return pipe(
        withLatestFrom(isDirty$),
        switchMap(([, isDirty]) => {
            if (isDirty) {
                SaveDiscardModel.open();
                return merge(SaveDiscardModel.saveClick$.pipe(onSave), SaveDiscardModel.discardClick$).pipe(take(1));
            }

            return of(void 0);
        }),
    );
}

export namespace SaveDiscardModel {
    export const [saveClick$, save] = createSignal();
    export const [discardClick$, discard] = createSignal();
    export const [cancel$, cancel] = createSignal();

    export const [open$, open] = createSignal();

    export const [useOpen] = bind(
        merge(merge(cancel$, saveClick$, discardClick$).pipe(map(() => false)), open$.pipe(map(() => true))),
        false,
    );
}

export default function SaveDiscardModal() {
    return (
        <Modal
            title={"Delete Existing Project Without Saving?"}
            closable={false}
            onCancel={SaveDiscardModel.cancel}
            open={SaveDiscardModel.useOpen()}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.LINKERROR} icon={mdiClose} onClick={SaveDiscardModel.cancel}>
                        Cancel
                    </Button>
                    <Button type={ButtonType.ERROR} icon={mdiFileDocumentPlus} onClick={SaveDiscardModel.discard}>
                        Discard Changes
                    </Button>
                    <Button type={ButtonType.PRIMARY} icon={mdiDownload} onClick={SaveDiscardModel.save}>
                        Save
                    </Button>
                </div>
            }
        >
            <div className={"mt-8 flex flex-row justify-center"}>
                <p className={"w-80 text-justify"}>
                    There are unsaved changes to the current project. Would you like to save or discard changes?
                </p>
            </div>
        </Modal>
    );
}
