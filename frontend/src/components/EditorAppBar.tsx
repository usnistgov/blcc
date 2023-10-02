import ButtonBar from "./ButtonBar";
import button, {ButtonType} from "./Button";
import {mdiContentSave, mdiFileDocumentPlus, mdiFolder, mdiPlay} from "@mdi/js";
import AppBar from "./AppBar";
import Model from "../model/Model";
import {useNavigate} from "react-router-dom";
import {useSubscribe} from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";

const {component: NewButton} = button();
const {component: OpenButton} = button();
const {component: SaveButton} = button();
const {component: SaveAsButton} = button();

const {click$: runAnalysisClick$, component: RunAnalysisButton} = button();

/**
 * The app bar for the editor context.
 */
export default function EditorAppBar() {
    const navigate = useNavigate();
    const projectName = Model.useProjectName();

    useSubscribe(runAnalysisClick$, () => navigate("/results"), [navigate]);

    return <AppBar className={"bg-primary"}>
        <ButtonBar className={"p-2"}>
            <NewButton type={ButtonType.PRIMARY} icon={mdiFileDocumentPlus}>
                New
            </NewButton>
            <OpenButton type={ButtonType.PRIMARY} icon={mdiFolder}>
                Open
            </OpenButton>
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
        <HelpButtons/>
    </AppBar>
}