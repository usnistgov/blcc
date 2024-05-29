import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal } from "antd";
import { map, merge, type Observable, Subject } from "rxjs";
import { ButtonType, Button } from "../Button";
import { mdiCheck } from "@mdi/js";

export type Message = {
    title: string;
    message: string;
}

export default function messageModal(message$: Observable<Message>) {
    const okClick$ = new Subject<void>();
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
                    <Button type={ButtonType.SUCCESS} icon={mdiCheck} onClick={() => okClick$.next()}>
                        OK
                    </Button>
                }
            >
                <p>{message}</p>
            </Modal>
        }
    }
}
