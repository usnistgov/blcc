import { mdiFileDocument, mdiHelp, mdiHome } from "@mdi/js";
import ButtonBar from "components/ButtonBar";
import { Button, ButtonType } from "components/input/Button";
import { Link, useNavigate } from "react-router-dom";
import { Strings } from "constants/Strings";

export default function HelpButtons() {
    const navigate = useNavigate();
    
    return (
        <ButtonBar className={"p-2"}>
            <Link to={"/docs/Placeholder.pdf"} target="_blank">
                <Button type={ButtonType.PRIMARY} icon={mdiFileDocument} tooltip={Strings.USER_GUIDE}>
                    User Guide
                </Button>
            </Link>
            <Link to={"/docs/Placeholder.pdf"} target="_blank">
                <Button icon={mdiHelp} tooltip={Strings.FAQ}>
                    FAQ
                </Button>
            </Link>
            <Button type={ButtonType.PRIMARY} icon={mdiHome} tooltip={Strings.HOME} onClick={() => navigate("/")}>
                Home
            </Button>
        </ButtonBar>
    );
}
