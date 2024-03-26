import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import { mdiFileDocument, mdiHelp } from "@mdi/js";
import { Link } from "react-router-dom";

const { component: UserGuideButton } = button();
const { component: FaqButton } = button();

export default function HelpButtons() {
    return (
        <ButtonBar className={"p-2"}>
            <Link to={"/docs/Placeholder.pdf"} target="_blank">
                <UserGuideButton type={ButtonType.PRIMARY} icon={mdiFileDocument}>
                    User Guide
                </UserGuideButton>
            </Link>
            <Link to={"/docs/Placeholder.pdf"} target="_blank">
                <FaqButton icon={mdiHelp}>FAQ</FaqButton>
            </Link>
        </ButtonBar>
    );
}
