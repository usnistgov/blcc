import { mdiCheck } from "@mdi/js";
import { state, useStateObservable } from "@react-rxjs/core";
import { Modal } from "antd";
import { Button, ButtonType } from "components/input/Button";
import { useMemo } from "react";
import { Subject, map, merge } from "rxjs";

// Global streams so we can open this modal from anywhere in the application.
const sTitle$ = new Subject<string>();
const title$ = state(sTitle$, "");
const sMessage$ = new Subject<string>();
const message$ = state(sMessage$, "");

/**
 * Opens the modal to show the given title and message.
 *
 * @param title The title of the confirmation modal.
 * @param message The message content of the confirmation modal.
 */
export function showMessage(title: string, message: string) {
    sTitle$.next(title);
    sMessage$.next(message);
}

/**
 * Modal component that displays a simple message that the user must acknowledge.
 */
export default function MessageModal() {
    const [isOpen$, sClose$] = useMemo(() => {
        const sClose$ = new Subject<void>();
        const isOpen$ = state(merge(sClose$.pipe(map(() => false)), sTitle$.pipe(map(() => true))), false);

        return [isOpen$, sClose$];
    }, []);

    const title = useStateObservable(title$);
    const message = useStateObservable(message$);
    const open = useStateObservable(isOpen$);

    return (
        <Modal
            title={title}
            closable={false}
            maskClosable={false}
            onCancel={() => sClose$.next()}
            open={open}
            footer={
                <Button type={ButtonType.SUCCESS} icon={mdiCheck} onClick={() => sClose$.next()}>
                    OK
                </Button>
            }
        >
            <p>{message}</p>
        </Modal>
    );
}
