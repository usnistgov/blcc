import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, message } from "antd";
import { map, merge, type Observable } from "rxjs";
import button, { ButtonType } from "../Button";
import { mdiCheck } from "@mdi/js";

export type Message = {
    title: string;
    message: string;
}

export default function messageModal(message$: Observable<Message>) {
    const { component: OkButton, click$: okClick$ } = button();
    const [useMessage] = bind(message$, { title: "", message: "" });

    const [cancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            merge(cancel$, okClick$).pipe(map(() => false)),
            message$.pipe(map(() => true))
        ),
        false
    );

    return {
        component: function MessageModal() {
            const { title, message } = useMessage();
            return <Modal
                title={title}
                closable={false}
                maskClosable={false}
                onCancel={cancel}
                open={useOpen()}
                footer={
                    <OkButton type={ButtonType.SUCCESS} icon={mdiCheck}>
                        OK
                    </OkButton>
                }
            >
                <p>{message}</p>
            </Modal>
        }
    }
}
