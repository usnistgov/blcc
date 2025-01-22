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
import { createSignal } from "@react-rxjs/utils";
import { convert } from "blcc-format/Converter";
import { resetToDefaultProject } from "blcc-format/effects";
import { showMessage } from "components/modal/MessageModal";
import saveDiscardModal from "components/modal/SaveDiscardModal";
import { Strings } from "constants/Strings";
import { Effect } from "effect";
import { Subject, merge } from "rxjs";
import { filter, map, sample, tap, withLatestFrom } from "rxjs/operators";
import { download } from "util/DownloadFile";
import { sampleMany } from "util/Operators";

const [newClick$, newClick] = createSignal<void>();
const openClick$ = new Subject<void>();
const saveClick$ = new Subject<void>();

// Actions that can open the confirmation dialog
enum OpenDiscard {
    NEW = 0,
    OPEN = 1,
}

// Click streams mapped to their respective actions
const newOpen$ = merge(newClick$.pipe(map(() => OpenDiscard.NEW)), openClick$.pipe(map(() => OpenDiscard.OPEN)));

// Create the confirmation dialog. Only opens if the current project is dirty.
const {
    component: SaveDiscardModal,
    saveClick$: modalSaveClick$,
    discardClick$,
} = saveDiscardModal<OpenDiscard>(
    newOpen$.pipe(
        withLatestFrom(isDirty$),
        filter(([, dirty]) => dirty),
        map(([value]) => value),
    ),
);

/*
 * Performs a save when the save button on the confirmation modal is clicked.
 * Outputs the save action.
 */
const confirmSave$ = modalSaveClick$.pipe(
    withLatestFrom(hash$),
    tap(async ([, hash]) => await save(hash, "download.blcc")),
    map(([action]) => action),
);

/*
 * Stream that represents when new project should be created. Either when the new button
 * is clicked and the current project is not dirty, or when the discard button is clicked
 * on the confirmation dialog, or when the confirmation dialog executes a save.
 */
const new$ = merge(
    sampleMany(newClick$, [isDirty$]).pipe(filter(([dirty]) => !dirty)),
    merge(discardClick$, confirmSave$).pipe(filter((action) => action === OpenDiscard.NEW)),
);

/*
 * Stream that represents when project should be opened. Either when the open button is
 * clicked and the current project is not dirty, or when the discard button is clicked on
 * the confirmation dialog, or when the confirmation dialog executes a save.
 */
const open$ = merge(
    sampleMany(openClick$, [isDirty$]).pipe(filter(([dirty]) => !dirty)),
    merge(discardClick$, confirmSave$).pipe(filter((action) => action === OpenDiscard.OPEN)),
);

// Saves the current project and saves the hash for dirty detection.
async function save(hash: string, filename: string) {
    await db.dirty.clear();
    await db.dirty.add({ hash });
    download(await db.export(), filename);
}

/**
 * The app bar for the editor context.
 */
export default function EditorAppBar() {
    const navigate = useNavigate();
    const isOnEditorPage = useMatch("/editor");

    useSubscribe(
        new$,
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
    useSubscribe(hash$.pipe(sample(saveClick$)), async (hash) => await save(hash, "download.blcc"));
    useSubscribe(open$, () => document.getElementById("open")?.click());

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <SaveDiscardModal />
            <ButtonBar className={"p-2"}>
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiFileDocumentPlus}
                    onClick={() => newClick()}
                    tooltip={Strings.NEW}
                >
                    New
                </Button>
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiFolder}
                    onClick={() => openClick$.next()}
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
                    onClick={() => saveClick$.next()}
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
