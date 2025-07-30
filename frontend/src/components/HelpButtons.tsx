import { mdiFileDocument, mdiHelp, mdiHome } from "@mdi/js";
import ButtonBar from "components/ButtonBar";
import { Button, ButtonType } from "components/input/Button";
import { Link, useNavigate } from "react-router-dom";
import { Strings } from "constants/Strings";

export default function HelpButtons() {
    const navigate = useNavigate();

    return (
        <ButtonBar className={"p-2"}>
            <Button
                type={ButtonType.PRIMARY}
                icon={mdiFileDocument}
                tooltip={Strings.USER_GUIDE}
                onClick={() => window.open("/docs/BLCCUserGuide.pdf")}
            >
                User Guide
            </Button>
            <Button icon={mdiHelp} tooltip={Strings.FAQ} onClick={() => window.open("/docs/BLCCUserGuide.pdf")}>
                FAQ
            </Button>
            <Button type={ButtonType.PRIMARY} icon={mdiHome} tooltip={Strings.HOME} onClick={() => navigate("/")}>
                Home
            </Button>
        </ButtonBar>
    );
}
