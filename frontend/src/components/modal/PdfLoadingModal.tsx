import { mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Typography } from "antd";
import { ButtonType } from "components/input/Button";

export namespace PdfLoadingModel {
    export const [showLoadingModal, setShowLoadingModal] = createSignal<boolean>();
    export const [useShowLoadingModal] = bind(showLoadingModal, false);
}

export default function PdfLoadingModal() {
    const showLoadingModal = PdfLoadingModel.useShowLoadingModal();

    return (
        <Modal
            title={
                <div className="flex justify-center mt-4">
                    <Icon path={mdiLoading} size={4} className="animate-spin" />
                </div>
            }
            open={showLoadingModal}
            closable={false}
            footer={null}
        >
            <div className="flex justify-center mt-10">
                <Typography.Title level={4}>Downloading...</Typography.Title>
            </div>
        </Modal>
    );
}
