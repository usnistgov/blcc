import { mdiClose, mdiFile, mdiPlus } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal } from "antd";
import { downloadBlccFile } from "blcc-format/DownloadFile";
import { Button, ButtonType } from "components/input/Button";
import { TestInput } from "components/input/TestInput";
import { Strings } from "constants/Strings";
import { Effect } from "effect";
import { EditorModel } from "model/EditorModel";
import { Model } from "model/Model";
import { map, type Observable } from "rxjs";

export default function saveAsModal() {

    const saveAsInput = EditorModel.useSaveAsInput();

    return (
        <Modal
        title={"Delete Existing Project Without Saving?"}
                    closable={false}
                    onCancel={() => EditorModel.cancel()}
                    open={EditorModel.useOpen()}
                    footer={
                        <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                            <Button type={ButtonType.ERROR} icon={mdiClose} onClick={EditorModel.cancel}>
                                Cancel
                            </Button>
                            <Button type={ButtonType.PRIMARY} icon={mdiFile} disabled={EditorModel.useDisabled()} onClick={() => Effect.runPromise(downloadBlccFile(saveAsInput))}>
                                Save
                            </Button>
                        </div>
                    }>
            <div className={"mt-8 flex flex-row justify-center"}>
                        <TestInput
                            getter={EditorModel.useSaveAsInput}
                            onChange={(event) => {
                                const change = event.currentTarget.value;
                                EditorModel.saveAsInput(change);
                            }}
                        />
                    </div>
        </Modal>
    )
}