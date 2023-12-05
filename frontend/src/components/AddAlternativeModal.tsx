import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { Observable, merge } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import button, { ButtonType } from "../components/Button";
import textInput, { TextInputType } from "../components/TextInput";
import { Model } from "../model/Model";
import { getNewID } from "../util/Util";
const { Title } = Typography;

export type ModalProps = {
    open?: boolean;
};

export type ModalComp = {
    component: React.FC<PropsWithChildren & ModalProps>;
};

const { click$: addAlternative$, component: AddAlternativeBtn } = button();
const { click$: cancel$, component: CancelBtn } = button();
const { onChange$: addAltChange$, component: NewAltInput } = textInput();

export const modifiedAddAlternative$ = addAlternative$.pipe(
    withLatestFrom(Model.alternatives$),
    withLatestFrom(addAltChange$),
    map(([alts, name]) => {
        const nextID = getNewID(alts[1]);
        return {
            id: nextID,
            name: name,
            costs: [],
            baseline: false
        };
    })
);

function AddAlternativeModal(modifiedOpenModal$: Observable<boolean>) {
    const [modalCancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            modifiedOpenModal$,
            cancel$.pipe(map(() => false)),
            modifiedAddAlternative$.pipe(map(() => false)),
            modalCancel$.pipe(map(() => false))
        ),
        false
    );

    return {
        modifiedAddAlternative$,
        component: () => {
            const openModal = useOpen();

            return (
                <Modal
                    title="Add New Alternative"
                    open={openModal}
                    onCancel={cancel}
                    okButtonProps={{ disabled: false }}
                    cancelButtonProps={{ disabled: false }}
                    footer={[
                        <CancelBtn key="back" type={ButtonType.ERROR}>
                            Return
                        </CancelBtn>,
                        <AddAlternativeBtn type={ButtonType.PRIMARY} key="add">
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

export default AddAlternativeModal;
