import React from "react";
import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import AppBar from "./AppBar";
import { mdiArrowLeft, mdiPlay } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";
import Model from "../model/Model";

const { click$: backClick$, component: BackButton } = button();
const { click$: runClick$, component: RunButton } = button();

export default function ResultsAppBar() {
    const navigate = useNavigate();
    //const projectName = Model.useProjectName();

    useSubscribe(backClick$, () => navigate(-1), [navigate]);

    return (
        <AppBar className={"bg-primary"}>
            <ButtonBar className={"p-2"}>
                <BackButton type={ButtonType.PRIMARY} icon={mdiArrowLeft} iconSide={"left"}>
                    Back to Editor
                </BackButton>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-white"}>{Model.name}</p>
                <div className={"pl-4"}>
                    <RunButton type={ButtonType.PRIMARY_INVERTED} icon={mdiPlay}>
                        Run
                    </RunButton>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
