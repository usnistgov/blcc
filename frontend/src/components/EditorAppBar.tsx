import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import { mdiContentSave, mdiFileDocumentPlus, mdiFolder, mdiPlay } from "@mdi/js";
import AppBar from "./AppBar";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";
import { defaultReleaseYear$, useName } from "../model/Model";
import { db } from "../model/db";
import { Version } from "../blcc-format/Verison";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    SocialCostOfGhgScenario
} from "../blcc-format/Format";
import { Country } from "../constants/LOCATION";
import "dexie-export-import";
import { download } from "../util/DownloadFile";
import { convert } from "../blcc-format/Converter";
import { sample } from "rxjs";
import { withLatestFrom } from "rxjs/operators";

const { click$: newClick$, component: NewButton } = button();
const { click$: openClick$, component: OpenButton } = button();
const { click$: saveClick$, component: SaveButton } = button();

const { click$: runAnalysisClick$, component: RunAnalysisButton } = button();

/**
 * The app bar for the editor context.
 */
export default function EditorAppBar() {
    const navigate = useNavigate();

    useSubscribe(
        newClick$.pipe(withLatestFrom(defaultReleaseYear$)),
        async ([, releaseYear]) => {
            // TODO make a modal to make sure the user doesn't want to save
            await db.delete();
            await db.open();
            db.projects.add({
                version: Version.V1,
                name: "Untitled Project",
                analysisType: AnalysisType.FEDERAL_FINANCED,
                dollarMethod: DollarMethod.CONSTANT,
                studyPeriod: 25,
                constructionPeriod: 0,
                discountingMethod: DiscountingMethod.END_OF_YEAR,
                location: {
                    country: Country.USA
                },
                alternatives: [],
                costs: [],
                ghg: {
                    socialCostOfGhgScenario: SocialCostOfGhgScenario.SCC,
                    emissionsRateScenario: EmissionsRateScenario.BASELINE
                },
                releaseYear
            });

            navigate("/editor");
        },
        [navigate]
    );
    useSubscribe(saveClick$, async () => download(await db.export(), "download.blcc"));
    useSubscribe(runAnalysisClick$, () => navigate("/results"), [navigate]);
    useSubscribe(openClick$, () => document.getElementById("open")?.click());

    return (
        <AppBar className={"bg-primary"}>
            <ButtonBar className={"p-2"}>
                <NewButton type={ButtonType.PRIMARY} icon={mdiFileDocumentPlus}>
                    New
                </NewButton>
                <OpenButton type={ButtonType.PRIMARY} icon={mdiFolder}>
                    Open
                </OpenButton>
                <input
                    className={"hidden"}
                    type={"file"}
                    id={"open"}
                    onClick={(event) => (event.currentTarget.value = "")}
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
                <SaveButton type={ButtonType.PRIMARY} icon={mdiContentSave}>
                    Save
                </SaveButton>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-base-lightest"}>{useName() || "Untitled Project"}</p>
                <div className={"pl-4"}>
                    <RunAnalysisButton type={ButtonType.PRIMARY_INVERTED} icon={mdiPlay} iconSide={"right"}>
                        Reports and Analysis
                    </RunAnalysisButton>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
