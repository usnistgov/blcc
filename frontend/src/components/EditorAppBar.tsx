import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import { mdiContentSave, mdiFileDocumentPlus, mdiFolder, mdiPlay } from "@mdi/js";
import AppBar from "./AppBar";
import Model from "../model/Model";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";
import { upload } from "../blcc-format/Import";
import { sample } from "rxjs";
import { download } from "../util/DownloadFile";

const { component: NewButton } = button();
const { click$: openClick$, component: OpenButton } = button();
const { click$: saveClick$, component: SaveButton } = button();
const { component: SaveAsButton } = button();

const { click$: runAnalysisClick$, component: RunAnalysisButton } = button();

/**
 * The app bar for the editor context.
 */
export default function EditorAppBar() {
    const navigate = useNavigate();
    const projectName = Model.useProjectName();

    useSubscribe(Model.project$.pipe(sample(saveClick$)), (project) => download(project, project.name));
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
                    onChange={(event) => {
                        if (event.currentTarget.files) upload(event.currentTarget.files);
                    }}
                />
                <SaveButton type={ButtonType.PRIMARY} icon={mdiContentSave}>
                    Save
                </SaveButton>
                <SaveAsButton type={ButtonType.PRIMARY} icon={mdiContentSave}>
                    Save As
                </SaveAsButton>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-base-lightest"}>{projectName}</p>
                <div className={"pl-4"}>
                    <RunAnalysisButton type={ButtonType.PRIMARY_INVERTED} icon={mdiPlay}>
                        Reports and Analysis
                    </RunAnalysisButton>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
