import { mdiClose, mdiContentSave } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal } from "antd";
import { downloadBlccFile } from "blcc-format/DownloadFile";
import { Button, ButtonType } from "components/input/Button";
import { TestInput } from "components/input/TestInput";
import { Effect } from "effect";
import { Model } from "model/Model";
import { map, merge, pipe, switchMap } from "rxjs";
import { startWith, tap } from "rxjs/operators";
import { sampleOne } from "util/Operators";
import { BlccRuntime } from "util/runtime";

export function showSaveAsModal() {
    return pipe(
        tap(() => SaveAsModel.open()),
        switchMap(() => SaveAsModel.done$),
    );
}

export namespace SaveAsModel {
    export const [cancel$, cancel] = createSignal();
    export const [open$, open] = createSignal();
    export const [done$, done] = createSignal();

    export const [useOpen] = bind(
        merge(merge(cancel$, done$).pipe(map(() => false)), open$.pipe(map(() => true))),
        false,
    );

    // Stream of name to use when saving a file
    // Default to current project name when the modal is opened
    export const [saveAsInput$, saveAsInput] = createSignal<string>();
    const currentInput$ = sampleOne(open$, Model.name.$).pipe(
        switchMap((name) => merge(saveAsInput$).pipe(startWith(name))),
    );

    // Hook to use for name for saved file (defaults to "")
    export const [useSaveAsInput] = bind(currentInput$, "");

    // Whether save button on save modal should be disabled (true if name is empty, and should be disabled)
    export const [useDisabledSaveInput] = bind(
        currentInput$.pipe(map((name) => name === "" || name === undefined)),
        true,
    );
}

export default function SaveAsModal() {
    const saveAsInput = SaveAsModel.useSaveAsInput();

    return (
        <Modal
            title={"Save File As:"}
            closable={false}
            onCancel={SaveAsModel.cancel}
            open={SaveAsModel.useOpen()}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.ERROR} icon={mdiClose} onClick={SaveAsModel.cancel}>
                        Cancel
                    </Button>
                    <Button
                        type={ButtonType.PRIMARY}
                        icon={mdiContentSave}
                        disabled={SaveAsModel.useDisabledSaveInput()}
                        onClick={() => {
                            BlccRuntime.runPromise(
                                Effect.gen(function* () {
                                    yield* downloadBlccFile(saveAsInput);
                                    SaveAsModel.done();
                                }),
                            );
                        }}
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
                    getter={SaveAsModel.useSaveAsInput}
                    onChange={(event) => {
                        const change = event.currentTarget.value;
                        SaveAsModel.saveAsInput(change);
                    }}
                />
            </div>
        </Modal>
    );
}
