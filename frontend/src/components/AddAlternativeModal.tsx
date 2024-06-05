import { mdiClose, mdiPlus } from "@mdi/js";
import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Typography } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    BehaviorSubject,
    type Observable,
    Subject,
    combineLatest,
    distinctUntilChanged,
    merge,
    sample,
    switchMap,
} from "rxjs";
import { map } from "rxjs/operators";
import { useSubscribe } from "../hooks/UseSubscribe";
import { currentProject$ } from "../model/Model";
import { db } from "../model/db";
import { guard, isFalse } from "../util/Operators";
import { Button, ButtonType } from "./Button";
import { TextInput, TextInputType } from "./TextInput";

type AddAlternativeModalProps = {
    open$: Observable<boolean>;
    cancel$?: Subject<void>;
};

/**
 * Creates a new alternative in the DB and returns the new ID.
 * @param projectID the ID of the project to create the alternative for.
 * @param name the name of the new alternative.
 */
function createAlternativeInDB([projectID, name]: [number, string]): Promise<number> {
    return db.transaction("rw", db.alternatives, db.projects, async () => {
        console.log("hello");

        // Add new alternative and get its ID
        const newID = await db.alternatives.add({
            name,
            costs: [],
            baseline: false,
        });

        // Add alternative ID to current project
        await db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                project.alternatives.push(newID);
            });

        return newID;
    });
}

/**
 * Component for adding a new alternative to the project. Opens a modal which asks for a name and creates the new
 * alternative object.
 */
export default function AddAlternativeModal({ open$, cancel$ }: AddAlternativeModalProps) {
    const navigate = useNavigate();
    const [modalCancel$, cancel, useOpen, isOpen$, sName$, cancelClick$, addClick$, newAlternativeID$, disableAdd] =
        useMemo(() => {
            const sName$ = new BehaviorSubject<string | undefined>(undefined);
            const addClick$ = new Subject<void>();
            const cancelClick$ = new Subject<void>();
            const [disableAdd] = bind(sName$.pipe(map((name) => name === "" || name === undefined)), false);

            const newAlternativeID$ = combineLatest([currentProject$, sName$.pipe(guard())]).pipe(
                sample(addClick$),
                distinctUntilChanged(),
                switchMap(createAlternativeInDB),
                shareLatest(),
            );

            const [modalCancel$, cancel] = createSignal();
            const [useOpen, isOpen$] = bind(
                merge(open$, merge(cancelClick$, newAlternativeID$, modalCancel$).pipe(map(() => false))),
                false,
            );

            return [
                modalCancel$,
                cancel,
                useOpen,
                isOpen$,
                sName$,
                cancelClick$,
                addClick$,
                newAlternativeID$,
                disableAdd,
            ];
        }, [open$]);

    // Set name field to nothing when the modal closes
    useSubscribe(isOpen$.pipe(isFalse()), () => sName$.next(undefined));
    // Output cancel signal
    useSubscribe(modalCancel$, cancel$);
    // Navigate to newly created alternative
    useSubscribe(newAlternativeID$, (newID) => navigate(`/editor/alternative/${newID}`), [navigate]);

    return (
        <Modal
            title="Add New Alternative"
            open={useOpen()}
            onCancel={cancel}
            okButtonProps={{ disabled: false }}
            cancelButtonProps={{ disabled: false }}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.ERROR} icon={mdiClose} wire={cancelClick$}>
                        Cancel
                    </Button>
                    <Button disabled={disableAdd()} type={ButtonType.PRIMARY} icon={mdiPlus} wire={addClick$}>
                        Add
                    </Button>
                </div>
            }
        >
            <div>
                <Typography.Title level={5}>Alternative Name</Typography.Title>
                <TextInput type={TextInputType.PRIMARY} wire={sName$} />
            </div>
            <p>Further changes can be made in the associated alternative page.</p>
        </Modal>
    );
}
