import { Modal } from "antd";
import button, { ButtonType } from "../Button";
import { mdiCheck, mdiClose } from "@mdi/js";
import { map, merge, type Observable } from "rxjs";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";

type ConfirmationModalProps = {
    title?: string;
    message?: string;
    confirmLabel?: string;
    confirmIcon?: string;
    cancelLabel?: string;
    cancelIcon?: string;
}

const { component: ConfirmButton, click$: confirmClick$ } = button();
const { component: CancelButton, click$: cancelClick$ } = button();

export default function confirmationModal(open$: Observable<void>) {
    const [cancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(merge(cancel$, cancelClick$, confirmClick$).pipe(map(() => false)), open$.pipe(map(() => true))),
        false
    )

    return {
        component: function ConfirmationModal({ confirmLabel = "Confirm", confirmIcon = mdiCheck, cancelLabel = "Cancel", cancelIcon = mdiClose, title = "", message = "" }: ConfirmationModalProps) {
            return <Modal
                title={title}
                onCancel={cancel}
                open={useOpen()}
                footer={
                    <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                        <CancelButton type={ButtonType.ERROR} icon={cancelIcon}>
                            {cancelLabel}
                        </CancelButton>
                        <ConfirmButton type={ButtonType.PRIMARY} icon={confirmIcon}>
                            {confirmLabel}
                        </ConfirmButton>
                    </div>
                }>
                <div className={"flex flex-row justify-center mt-8"}>
                    <p className={"w-80 text-justify"}>{message}</p>
                </div>
            </Modal>;
        }
    }
}
