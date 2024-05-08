import { map, merge, sample, type Observable, Subject } from "rxjs";
import { ButtonType, Button } from "../Button";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import Modal from "antd/es/modal/Modal";
import { mdiClose, mdiDownload, mdiFileDocumentPlus } from "@mdi/js";

export default function saveDiscardModal<T>(open$: Observable<T>) {
    const saveClick$ = new Subject<void>();
    const discardClick$ = new Subject<void>();
    const cancelClick$ = new Subject<void>();

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
                        <Button type={ButtonType.LINKERROR} icon={mdiClose} onClick={() => cancelClick$.next()}>
                            Cancel
                        </Button>
                        <Button type={ButtonType.ERROR} icon={mdiFileDocumentPlus} onClick={() => discardClick$.next()}>
                            Discard Changes
                        </Button>
                        <Button type={ButtonType.PRIMARY} icon={mdiDownload} onClick={() => saveClick$.next()}>
                            Save
                        </Button>
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
