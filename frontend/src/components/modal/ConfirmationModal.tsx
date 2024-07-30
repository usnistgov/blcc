import { state, useStateObservable } from "@react-rxjs/core";
import { Modal } from "antd";
import { useMemo } from "react";
import type { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { P, match } from "ts-pattern";

type ConfirmationModalProps = {
    title: string;
    message: string;
    open$: Observable<unknown | boolean>;
    confirm$: Subject<void>;
};

export default function ConfirmationModal({ message, title, open$, confirm$ }: ConfirmationModalProps) {
    const [isOpen$] = useMemo(() => {
        const isOpen$ = state(
            open$.pipe(
                map((value) =>
                    match(value)
                        .with(P.boolean, (bool) => bool)
                        .otherwise(() => true),
                ),
            ),
            false,
        );

        return [isOpen$];
    }, [open$]);

    const isOpen = useStateObservable(isOpen$);

    return (
        <Modal title={title} closable={true} onOk={() => confirm$.next()} open={isOpen}>
            {message}
        </Modal>
    );
}
