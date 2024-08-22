import { state, useStateObservable } from "@react-rxjs/core";
import { Modal } from "antd";
import type { LegacyButtonType } from "antd/es/button/button";
import { useMemo } from "react";
import { Subject, merge } from "rxjs";
import { map } from "rxjs/operators";

// Global streams so we can open this modal from anywhere in the application.
const sTitle$ = new Subject<string>();
const title$ = state(sTitle$, "");
const sMessage$ = new Subject<string>();
const message$ = state(sMessage$, "");
const sOutputs$ = new Subject<Subject<void>>();
const output$ = state(sOutputs$, undefined);
const sConfig$ = new Subject<ConfirmConfig | undefined>();
const config$ = state(sConfig$, undefined);

/**
 * Configuration options to customize the confirmation modal
 */
export type ConfirmConfig = {
    okText?: string;
    okType?: LegacyButtonType;
};

/**
 * Opens the confirmation modal with the given parameters and pushes the values in their associated streams.
 *
 * @param title The title of the modal.
 * @param message The message content of the modal.
 * @param output$ The stream representing the confirmation of the modal.
 * @param config Extra configuration options for the modal.
 */
export function confirm(title: string, message: string, output$: Subject<void>, config?: ConfirmConfig) {
    sTitle$.next(title);
    sMessage$.next(message);
    sOutputs$.next(output$);
    sConfig$.next(config);
}

/**
 * Modal component that displays a message that the user can confirm or ignore. Mostly intended for things like
 * confirming to delete or change an option in the application.
 */
export default function ConfirmationModal() {
    const [isOpen$, sClose$] = useMemo(() => {
        const sClose$ = new Subject<void>();
        const isOpen$ = state(merge(sClose$.pipe(map(() => false)), sTitle$.pipe(map(() => true))), false);

        return [isOpen$, sClose$];
    }, []);

    const title = useStateObservable(title$);
    const message = useStateObservable(message$);
    const output = useStateObservable(output$);
    const isOpen = useStateObservable(isOpen$);
    const config = useStateObservable(config$);

    return (
        <Modal
            title={title}
            closable={true}
            onOk={() => {
                output?.next();
                sClose$.next();
            }}
            onCancel={() => sClose$.next()}
            open={isOpen}
            okType={config?.okType ?? "primary"}
            okText={config?.okText ?? "OK"}
        >
            {message}
        </Modal>
    );
}
