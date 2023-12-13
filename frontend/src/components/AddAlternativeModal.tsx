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
import { Model } from "../model/Model";
import { getNewID } from "../util/Util";
import { mdiClose, mdiPlus } from "@mdi/js";

const { Title } = Typography;
const { click$: addClick$, component: AddAlternativeBtn } = button();
const { click$: cancelClick$, component: CancelBtn } = button();
const { onChange$: name$, component: NewAltInput } = textInput();

export const addAlternative$ = combineLatest([Model.alternatives$, name$]).pipe(
    sample(addClick$),
    map(([alts, name]) => ({
        id: getNewID(alts),
        name: name,
        costs: [],
        baseline: false
    }))
);

export default function addAlternativeModal(open$: Observable<boolean>) {
    const [modalCancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            open$,
            cancelClick$.pipe(map(() => false)),
            addAlternative$.pipe(map(() => false)),
            modalCancel$.pipe(map(() => false))
        ),
        false
    );

    return {
        component: () => {
            const navigate = useNavigate();
            useSubscribe(addAlternative$, (alt) => {
                navigate(`/editor/alternative/${alt?.id - 1}`);
            });

            return (
                <Modal
                    title="Add New Alternative"
                    open={useOpen()}
                    onCancel={cancel}
                    okButtonProps={{ disabled: false }}
                    cancelButtonProps={{ disabled: false }}
                    footer={[
                        <CancelBtn key="back" type={ButtonType.ERROR} icon={mdiClose}>
                            Cancel
                        </CancelBtn>,
                        <AddAlternativeBtn type={ButtonType.PRIMARY} key="add" icon={mdiPlus}>
                            Add
                        </AddAlternativeBtn>
                    ]}
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
