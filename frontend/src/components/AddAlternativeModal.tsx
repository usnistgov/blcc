import { Button, Modal, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import button, { ButtonType } from "../components/Button";
import textInput, { TextInputType } from "../components/TextInput";

const { Title } = Typography;

const { click$: addAlternative$, component: AddAlternativeBtn } = button();
const { onChange$: addAltChange$, component: NewAltInput } = textInput();

export type ModalProps = {
    handleCancel: void;
    handleOk: void;
    open: boolean;
};

export type ModalComp = {
    component: React.FC<PropsWithChildren & ModalProps>;
};

export default function addAlternative(): ModalComp {
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
}
