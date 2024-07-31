import { state, useStateObservable } from "@react-rxjs/core";
import { Modal } from "antd";
import { useMemo } from "react";
import { Subject, merge } from "rxjs";
import { map } from "rxjs/operators";

const sTitle$ = new Subject<string>();
const title$ = state(sTitle$, "");
const sMessage$ = new Subject<string>();
const message$ = state(sMessage$, "");
const sOutputs$ = new Subject<Subject<void>>();
const output$ = state(sOutputs$, undefined);

export function confirm(title: string, message: string, output$: Subject<void>) {
    sTitle$.next(title);
    sMessage$.next(message);
    sOutputs$.next(output$);
}

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
        >
            {message}
        </Modal>
    );
}
