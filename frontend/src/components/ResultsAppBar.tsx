import React from "react";
import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import AppBar from "./AppBar";
import { mdiArrowLeft, mdiPlay } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";
import { Model } from "../model/Model";
import { E3Request, toE3Object } from "../model/E3Request";
import { sample } from "rxjs";
import { bind, shareLatest } from "@react-rxjs/core";

const { click$: backClick$, component: BackButton } = button();
const { click$: runClick$, component: RunButton } = button();

const e3Result$ = Model.project$.pipe(sample(runClick$), toE3Object(), E3Request(), shareLatest());
const [useE3Result] = bind(e3Result$, undefined);

export { e3Result$, useE3Result };

e3Result$.subscribe(console.log);

export default function ResultsAppBar() {
    const navigate = useNavigate();

    useSubscribe(backClick$, () => navigate(-1), [navigate]);

    return (
        <AppBar className={"bg-primary"}>
            <ButtonBar className={"p-2"}>
                <BackButton type={ButtonType.PRIMARY} icon={mdiArrowLeft}>
                    Back to Editor
                </BackButton>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-white"}>{Model.useName()}</p>
                <div className={"pl-4"}>
                    <RunButton type={ButtonType.PRIMARY_INVERTED} icon={mdiPlay} iconSide={"right"}>
                        Run
                    </RunButton>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
