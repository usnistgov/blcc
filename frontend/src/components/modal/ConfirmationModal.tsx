import { state, useStateObservable } from "@react-rxjs/core";
import { Modal } from "antd";
import type { LegacyButtonType } from "antd/es/button/button";
import { useMemo } from "react";
import { Subject, merge } from "rxjs";
import { map } from "rxjs/operators";

const sTitle$ = new Subject<string>();
const title$ = state(sTitle$, "");
const sMessage$ = new Subject<string>();
const message$ = state(sMessage$, "");
const sOutputs$ = new Subject<Subject<void>>();
const output$ = state(sOutputs$, undefined);
const sConfig$ = new Subject<ConfirmConfig | undefined>();
const config$ = state(sConfig$, undefined);

export type ConfirmConfig = {
    okText?: string;
    okType?: LegacyButtonType;
};

export function confirm(title: string, message: string, output$: Subject<void>, config?: ConfirmConfig) {
    sTitle$.next(title);
    sMessage$.next(message);
    sOutputs$.next(output$);
    sConfig$.next(config);
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
