import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { combineLatest, merge, Observable, sample } from "rxjs";
import { map } from "rxjs/operators";
import button, { ButtonType } from "../components/Button";
import textInput, { TextInputType } from "../components/TextInput";
import { useSubscribe } from "../hooks/UseSubscribe";
import { mdiClose, mdiPlus } from "@mdi/js";
import { currentProject$ } from "../model/Model";
import { Alternative } from "../blcc-format/Format";
import { db } from "../model/db";

const { Title } = Typography;
const { click$: addClick$, component: AddButton } = button();
const { click$: cancelClick$, component: CancelButton } = button();
const { onChange$: name$, component: NewAltInput } = textInput();

const newAlternative$ = combineLatest([
    currentProject$,
    name$.pipe(map((name) => ({ name: name, costs: [], baseline: false }) as Alternative))
]).pipe(sample(addClick$));

//TODO make inputs clear when closing modal

export default function addAlternativeModal(open$: Observable<boolean>) {
    const [modalCancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            open$,
            cancelClick$.pipe(map(() => false)),
            newAlternative$.pipe(map(() => false)),
            modalCancel$.pipe(map(() => false))
        ),
        false
    );

    return {
        component: () => {
            const navigate = useNavigate();
            useSubscribe(newAlternative$, async ([projectID, newAlternative]) => {
                const newID = await db.transaction("rw", db.alternatives, db.projects, async () => {
                    // Add new alternative and get its ID
                    const newID = await db.alternatives.add(newAlternative);

                    // Add alternative ID to current project
                    await db.projects
                        .where("id")
                        .equals(projectID)
                        .modify((project) => {
                            project.alternatives.push(newID);
                        });

                    return newID;
                });

                navigate(`/editor/alternative/${newID}`);
            });

            return (
                <Modal
                    title="Add New Alternative"
                    open={useOpen()}
                    onCancel={cancel}
                    okButtonProps={{ disabled: false }}
                    cancelButtonProps={{ disabled: false }}
                    footer={
                        <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                            <CancelButton type={ButtonType.ERROR} icon={mdiClose}>
                                Cancel
                            </CancelButton>
                            <AddButton type={ButtonType.PRIMARY} icon={mdiPlus}>
                                Add
                            </AddButton>
                        </div>
                    }
                >
                    <div>
                        <Title level={5}>Name</Title>
                        <NewAltInput type={TextInputType.PRIMARY} />
                    </div>
                    <p>Further changes can be made in the associated alternative page.</p>
                </Modal>
            );
        }
    };
}
