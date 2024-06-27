import { mdiContentSave, mdiFileDocumentPlus, mdiFolder, mdiPlay } from "@mdi/js";
import { DiscountingMethod, DollarMethod, EmissionsRateScenario, SocialCostOfGhgScenario } from "blcc-format/Format";
import { Version } from "blcc-format/Verison";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { Country } from "constants/LOCATION";
import { useSubscribe } from "hooks/UseSubscribe";
import { Model, hash$, isDirty$ } from "model/Model";
import { db } from "model/db";
import { useNavigate } from "react-router-dom";
import "dexie-export-import";
import { convert } from "blcc-format/Converter";
import saveDiscardModal from "components/modal/SaveDiscardModal";
import objectHash from "object-hash";
import { Subject, merge } from "rxjs";
import { filter, map, sample, tap, withLatestFrom } from "rxjs/operators";
import { download } from "util/DownloadFile";

const newClick$ = new Subject<void>();
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
    isDirty$.pipe(
        sample(newClick$),
        filter((dirty) => !dirty),
    ),
    merge(discardClick$, confirmSave$).pipe(filter((action) => action === OpenDiscard.NEW)),
);

/*
 * Stream that represents when project should be opened. Either when the open button is
 * clicked and the current project is not dirty, or when the discard button is clicked on
 * the confirmation dialog, or when the confirmation dialog executes a save.
 */
const open$ = merge(
    isDirty$.pipe(
        sample(openClick$),
        filter((dirty) => !dirty),
    ),
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

    useSubscribe(
        new$.pipe(withLatestFrom(Model.defaultReleaseYear$)),
        async ([, releaseYear]) => {
            const defaultProject = {
                version: Version.V1,
                name: "Untitled Project",
                dollarMethod: DollarMethod.CONSTANT,
                constructionPeriod: 0,
                discountingMethod: DiscountingMethod.END_OF_YEAR,
                location: {
                    country: Country.USA,
                },
                alternatives: [],
                costs: [],
                ghg: {
                    socialCostOfGhgScenario: SocialCostOfGhgScenario.SCC,
                    emissionsRateScenario: EmissionsRateScenario.BASELINE,
                },
                releaseYear,
            };

            // Add default project to db.
            await db.delete();
            await db.open();
            await db.projects.add(defaultProject);

            // Save hash so we can overwrite a project that has not changed defaults.
            await db.dirty.clear();
            await db.dirty.add({ hash: objectHash({ project: defaultProject, alternatives: [], costs: [] }) });

            navigate("/editor");
        },
        [navigate],
    );
    useSubscribe(hash$.pipe(sample(saveClick$)), async (hash) => await save(hash, "download.blcc"));
    useSubscribe(open$, () => document.getElementById("open")?.click());

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <SaveDiscardModal />
            <ButtonBar className={"p-2"}>
                <Button type={ButtonType.PRIMARY} icon={mdiFileDocumentPlus} onClick={() => newClick$.next()}>
                    New
                </Button>
                <Button type={ButtonType.PRIMARY} icon={mdiFolder} onClick={() => openClick$.next()}>
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
                        if (event.currentTarget.files !== null) {
                            const file = event.currentTarget.files[0];

                            await db.delete();
                            await db.open();

                            if (file.type === "text/xml") convert(file);
                            else await db.import(file);
                        }
                    }}
                />
                <Button type={ButtonType.PRIMARY} icon={mdiContentSave} onClick={() => saveClick$.next()}>
                    Save
                </Button>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-base-lightest"}>{Model.useName() || "Untitled Project"}</p>
                <div className={"pl-4"}>
                    <Button
                        type={ButtonType.PRIMARY_INVERTED}
                        icon={mdiPlay}
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
