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
        <div className={"w-full bg-base-darker xl:py-10 flex justify-center overflow-y-auto"}>
            <div
                className={
                    "bg-white flex flex-col flex-grow h-fit min-h-full " +
                    "xl:rounded-2xl xl:max-w-[1440px] xl:shadow-[0_0_30px_4px_rgba(0,0,0,0.75)]"
                }
            >
                <NistHeaderFooter>
                    <div className={"flex flex-col m-32 items-center"}>
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
