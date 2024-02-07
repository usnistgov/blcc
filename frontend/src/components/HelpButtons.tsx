import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import { mdiFileDocument } from "@mdi/js";

const { component: UserGuideButton } = button();

//TODO: add links to external resources
export default function HelpButtons() {
    return (
        <ButtonBar className={"p-2"}>
            <UserGuideButton type={ButtonType.PRIMARY} icon={mdiFileDocument}>
                User Guide
            </UserGuideButton>
        </ButtonBar>
    );
}
