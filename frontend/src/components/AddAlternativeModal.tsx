import { Button, Modal, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { map, withLatestFrom } from "rxjs/operators";
import button, { ButtonType } from "../components/Button";
import textInput, { TextInputType } from "../components/TextInput";

import { Model } from "../model/Model";
import { getNewID } from "../util/Util";
const { Title } = Typography;

export type ModalProps = {
    handleCancel: void;
    handleOk: void;
    open: boolean;
};

export type ModalComp = {
    component: React.FC<PropsWithChildren & ModalProps>;
};

const { click$: addAlternative$, component: AddAlternativeBtn } = button();
const { onChange$: addAltChange$, component: NewAltInput } = textInput();

export const modifiedAddAlternative$ = addAlternative$.pipe(
    withLatestFrom(Model.alternatives$),
    withLatestFrom(addAltChange$),
    map(([alts, name]) => {
        const nextID = getNewID(alts[1]);
        console.log("clicked here");
        return {
            id: nextID,
            name: name,
            costs: [],
            baseline: false
        };
    })
);

const AddAlternativeModal = () => {
    return {
        component: ({ handleCancel, handleOk, open }: PropsWithChildren & ModalProps) => {
            return (
                <Modal
                    title="Add New Alternative"
                    open={open}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okButtonProps={{ disabled: false }}
                    cancelButtonProps={{ disabled: false }}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            Return
                        </Button>,
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
};

export default AddAlternativeModal;
