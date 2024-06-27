import { mdiFileDocument, mdiHelp } from "@mdi/js";
import ButtonBar from "components/ButtonBar";
import { Button, ButtonType } from "components/input/Button";
import { Link } from "react-router-dom";

export default function HelpButtons() {
    return (
        <ButtonBar className={"p-2"}>
            <Link to={"/docs/Placeholder.pdf"} target="_blank">
                <Button type={ButtonType.PRIMARY} icon={mdiFileDocument}>
                    User Guide
                </Button>
            </Link>
            <Link to={"/docs/Placeholder.pdf"} target="_blank">
                <Button icon={mdiHelp}>FAQ</Button>
            </Link>
        </ButtonBar>
    );
}
