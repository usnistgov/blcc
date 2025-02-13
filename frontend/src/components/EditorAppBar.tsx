import { mdiArrowRight, mdiContentSave, mdiFileDocumentPlus, mdiFolder } from "@mdi/js";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { useSubscribe } from "hooks/UseSubscribe";
import { Model, sProject$ } from "model/Model";
import { DexieService } from "model/db";
import { useMatch, useNavigate } from "react-router-dom";
import "dexie-export-import";
import { Subscribe } from "@react-rxjs/core";
import { showMessage } from "components/modal/MessageModal";
import SaveAsModal, { showSaveAsModal } from "components/modal/SaveAsModal";
import SaveDiscardModal, { showSaveDiscard } from "components/modal/SaveDiscardModal";
import { Strings } from "constants/Strings";
import { Effect } from "effect";
import { resetToDefaultProject } from "effect/DefaultProject";
import { EditorModel } from "model/EditorModel";
import { ConverterService } from "services/ConverterService";
import { BlccRuntime } from "util/runtime";

/**
 * The app bar for the editor context.
 */
export default function EditorAppBar() {
    const navigate = useNavigate();
    const isOnEditorPage = useMatch("/editor");

    useSubscribe(
        EditorModel.newClick$.pipe(showSaveDiscard(showSaveAsModal())),
        async () => {
            await BlccRuntime.runPromise(
                Effect.gen(function* () {
                    const project = yield* resetToDefaultProject;
                    sProject$.next(project);
                }),
            );

            // Navigate to general information page after opening file
            if (isOnEditorPage === null) navigate("/editor");
        },
        [navigate],
    );
    useSubscribe(EditorModel.openClick$.pipe(showSaveDiscard(showSaveAsModal())), () =>
        document.getElementById("open")?.click(),
    );
    useSubscribe(EditorModel.saveClick$.pipe(showSaveAsModal()));

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <SaveDiscardModal />
            <Subscribe>
                <SaveAsModal />
            </Subscribe>
            <ButtonBar className={"p-2"}>
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiFileDocumentPlus}
                    onClick={() => EditorModel.newClick()}
                    tooltip={Strings.NEW}
                >
                    New
                </Button>
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiFolder}
                    onClick={() => EditorModel.openClick$.next()}
                    tooltip={Strings.OPEN}
                >
                    Open
                </Button>
                <input
                    className={"hidden"}
                    type={"file"}
                    id={"open"}
                    onClick={(event) => {
                        event.currentTarget.value = "";
                    }}
                    onChange={async (event) => {
                        await BlccRuntime.runPromise(
                            Effect.gen(function* () {
                                const db = yield* DexieService;

                                if (event.currentTarget.files === null) return;

                                const file = event.currentTarget.files[0];

                                yield* db.clearDB;

                                if (file.type.includes("xml")) {
                                    const converter = yield* ConverterService;
                                    const [project, alternatives, costs] = yield* converter.convert(file);

                                    yield* db.setProject(project);
                                    yield* db.setAlternatives(alternatives);
                                    yield* db.setCosts(costs);

                                    yield* db.hashCurrent.pipe(Effect.andThen(db.setHash));

                                    sProject$.next(project);
                                    showMessage(
                                        "Old Format Conversion",
                                        "Files from the previous version of BLCC must be converted to the new format. Some options are not able to be converted and must be checked manually. Double check converted files for correctness.",
                                    );
                                } else {
                                    yield* db.importProject(file);
                                    const project = yield* db.getProject();
                                    sProject$.next(project);
                                }
                            }),
                        );

                        if (isOnEditorPage === null) navigate("/editor");
                    }}
                />
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiContentSave}
                    onClick={EditorModel.saveClick}
                    tooltip={Strings.SAVE}
                >
                    Save
                </Button>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <Subscribe>
                    <Name />
                </Subscribe>
                <div className={"pl-4"}>
                    <Button
                        type={ButtonType.PRIMARY_INVERTED}
                        icon={mdiArrowRight}
                        iconSide={"right"}
                        onClick={() => navigate("/results")}
                    >
                        Reports and Analysis
                    </Button>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}

function Name() {
    return (
        <p className={"text-base-lightest"} id={"project-name"}>
            {Model.name.use() || "Untitled Project"}
        </p>
    );
}
