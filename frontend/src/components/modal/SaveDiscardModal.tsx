import { map, merge, sample, type Observable } from "rxjs";
import button, { ButtonType } from "../Button";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Modal from "antd/es/modal/Modal";
import { mdiClose, mdiDownload, mdiFileDocumentPlus } from "@mdi/js";

export default function saveDiscardModal<T>(open$: Observable<T>) {
    const { click$: saveClick$, component: SaveButton } = button();
    const { click$: discardClick$, component: DiscardButton } = button();
    const { click$: cancelClick$, component: CancelButton } = button();

    const [cancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            merge(cancel$, cancelClick$, saveClick$, discardClick$).pipe(map(() => false)),
            open$.pipe(map(() => true))
        ),
        false
    );

    return {
        saveClick$: open$.pipe(sample(saveClick$)),
        discardClick$: open$.pipe(sample(discardClick$)),
        component: function SaveDiscardModal() {
            return <Modal
                title={"Delete Existing Project Without Saving?"}
                closable={false}
                onCancel={cancel}
                open={useOpen()}
                footer={
                    <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                        <CancelButton type={ButtonType.LINKERROR} icon={mdiClose}>
                            Cancel
                        </CancelButton>
                        <DiscardButton type={ButtonType.ERROR} icon={mdiFileDocumentPlus}>
                            Discard Changes
                        </DiscardButton>
                        <SaveButton type={ButtonType.PRIMARY} icon={mdiDownload}>
                            Save
                        </SaveButton>
                    </div>
                }>
                <div className={"flex flex-row justify-center mt-8"}>
                    <p className={"w-80 text-justify"}>
                        There are unsaved changes to the current project. Would you like to save or discard changes?
                    </p>
                </div>
            </Modal>;
        }
    }
}
