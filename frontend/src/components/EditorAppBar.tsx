import { mdiArrowRight, mdiContentSave, mdiFileDocumentPlus, mdiFolder } from "@mdi/js";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { useSubscribe } from "hooks/UseSubscribe";
import { Model, hash$, isDirty$, sProject$ } from "model/Model";
import { clearDB, db, getAlternatives, getCosts, getProject, importProject, setHash, setProject } from "model/db";
import { useMatch, useNavigate } from "react-router-dom";
import "dexie-export-import";
import { Subscribe } from "@react-rxjs/core";
import { convert } from "blcc-format/Converter";
import { resetToDefaultProject } from "blcc-format/effects";
import { showMessage } from "components/modal/MessageModal";
import { Strings } from "constants/Strings";
import { Effect } from "effect";
import SaveAsModal from "./modal/SaveAsModal";
import { EditorModel } from "model/EditorModel";


/**
 * The app bar for the editor context.
 */
export default function EditorAppBar() {
    const navigate = useNavigate();
    const isOnEditorPage = useMatch("/editor");

    useSubscribe(
        EditorModel.new$,
        async () => {
            await Effect.runPromise(
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
    useSubscribe(EditorModel.open$, () => document.getElementById("open")?.click());

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <EditorModel.SaveDiscardModal />
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
                        await Effect.runPromise(
                            Effect.gen(function* () {
                                if (event.currentTarget.files === null) return;

                                const file = event.currentTarget.files[0];

                                yield* clearDB;

                                if (file.type.includes("xml")) {
                                    const convertedProject = yield* convert(file);
                                    yield* setProject(convertedProject);

                                    const alternatives = yield* getAlternatives;
                                    const costs = yield* getCosts;
                                    yield* setHash(convertedProject, alternatives, costs);

                                    sProject$.next(convertedProject);
                                    showMessage(
                                        "Old Format Conversion",
                                        "Files from the previous version of BLCC must be converted to the new format. Some options are not able to be converted and must be checked manually. Double check converted files for correctness.",
                                    );
                                } else {
                                    yield* importProject(file);
                                    const project = yield* getProject(1);
                                    if (project !== undefined) sProject$.next(project);
                                }
                            }),
                        );

                        if (isOnEditorPage === null) navigate("/editor");
                    }}
                />
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiContentSave}
                    onClick={() => EditorModel.saveClick$.next()}
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
