import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import { mdiFileDocument, mdiHelp } from "@mdi/js";

const { component: HelpButton } = button();
const { component: UserGuideButton } = button();

//TODO: add links to external resources
export default function HelpButtons() {
    return (
        <ButtonBar className={"p-2"}>
            <HelpButton type={ButtonType.PRIMARY} icon={mdiHelp}>
                Help
            </HelpButton>
            <UserGuideButton type={ButtonType.PRIMARY} icon={mdiFileDocument}>
                User Guide
            </UserGuideButton>
        </ButtonBar>
    );
}
