import "../nist-header-footer.sass";
import NistHeaderFooter from "../components/NistHeaderFooter";
import button, { ButtonType } from "../components/Button";
import { mdiArrowRight } from "@mdi/js";
import { useSubscribe } from "../hooks/UseSubscribe";
import { useNavigate } from "react-router-dom";
import logoUrl from "../images/logo.png";

const { click$: openEditorClick$, component: OpenEditorButton } = button();

export default function Index() {
    const navigate = useNavigate();
    useSubscribe(openEditorClick$, () => navigate("editor"));

    return (
        <div className={"flex w-full justify-center overflow-y-auto bg-base-darker xl:py-10"}>
            <div
                className={
                    "flex h-fit min-h-full flex-grow flex-col bg-white " +
                    "xl:max-w-[1440px] xl:rounded-2xl xl:shadow-[0_0_30px_4px_rgba(0,0,0,0.75)]"
                }
            >
                <NistHeaderFooter>
                    <div className={"m-32 flex flex-col items-center"}>
                        <img src={logoUrl} alt={"BLCC logo"} />
                        <a>Powered by E3</a>
                        <OpenEditorButton
                            className={"mt-16"}
                            type={ButtonType.PRIMARY}
                            icon={mdiArrowRight}
                            iconSide={"right"}
                        >
                            Open Editor
                        </OpenEditorButton>
                    </div>
                </NistHeaderFooter>
            </div>
        </div>
    );
}
