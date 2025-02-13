import {
    mdiClose,
    mdiContentSave,
    mdiContentSaveCheck,
    mdiContentSaveEdit,
    mdiContentSavePlus,
    mdiFile,
    mdiPlus,
} from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal } from "antd";
import Title from "antd/es/typography/Title";
import { downloadBlccFile } from "blcc-format/DownloadFile";
import { Button, ButtonType } from "components/input/Button";
import { TestInput } from "components/input/TestInput";
import { Strings } from "constants/Strings";
import { Effect } from "effect";
import { EditorModel } from "model/EditorModel";
import { Model } from "model/Model";
import { type Observable, map } from "rxjs";
import { BlccRuntime } from "util/runtime";

export default function saveAsModal() {
    const saveAsInput = EditorModel.useSaveAsInput();

    return (
        <Modal
            title={"Save File As:"}
            closable={false}
            onCancel={() => EditorModel.cancelSave()}
            open={EditorModel.useOpenSave()}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.ERROR} icon={mdiClose} onClick={EditorModel.cancelSave}>
                        Cancel
                    </Button>
                    <Button
                        type={ButtonType.PRIMARY}
                        icon={mdiContentSave}
                        disabled={EditorModel.useDisabledSaveInput()}
                        onClick={() => BlccRuntime.runPromise(downloadBlccFile(saveAsInput))}
                    >
                        Save
                    </Button>
                </div>
            }
        >
            <div className={"mt-8 flex flex-row items-end justify-center"}>
                <TestInput
                    className="w-80"
                    addonAfter=".blcc"
                    getter={EditorModel.useSaveAsInput}
                    onChange={(event) => {
                        const change = event.currentTarget.value;
                        EditorModel.saveAsInput(change);
                    }}
                />
            </div>
        </Modal>
    );
}
