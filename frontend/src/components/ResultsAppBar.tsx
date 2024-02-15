import React from "react";
import ButtonBar from "./ButtonBar";
import button, { ButtonType } from "./Button";
import AppBar from "./AppBar";
import { mdiArrowLeft, mdiPlay } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";
import { E3Request, toE3Object } from "../model/E3Request";
import { combineLatest, switchMap } from "rxjs";
import { bind, shareLatest } from "@react-rxjs/core";
import { alternatives$, costs$, currentProject$, project$, useName } from "../model/Model";
import { filter, map, withLatestFrom } from "rxjs/operators";
import { db } from "../model/db";
import objectHash from "object-hash";
import { liveQuery } from "dexie";

const { click$: backClick$, component: BackButton } = button();
const { click$: runClick$, component: RunButton } = button();

// Creates a hash of the current project
const hash$ = combineLatest([project$, alternatives$, costs$]).pipe(
    map(([project, alternatives, costs]) => {
        if (project === undefined) throw "Project is undefined";

        return objectHash({ project, alternatives, costs });
    })
);

// Result stream that pulls from cache if available.
const result$ = hash$.pipe(switchMap((hash) => liveQuery(() => db.results.get(hash))));
const [useResult] = bind(result$, undefined);
export { result$, useResult };

// True if the project has been run before, if anything has changed since, false.
const isCached$ = result$.pipe(map((result) => result !== undefined));

// Only send E3 request if we don't have the results cached
const e3Result$ = runClick$.pipe(
    withLatestFrom(isCached$),
    filter(([, cached]) => !cached),
    withLatestFrom(currentProject$),
    map(([, id]) => id),
    toE3Object(),
    E3Request(),
    shareLatest()
);

export default function ResultsAppBar() {
    const navigate = useNavigate();

    useSubscribe(backClick$, () => navigate("/editor"), [navigate]);
    useSubscribe(e3Result$.pipe(withLatestFrom(hash$)), ([result, hash]) => db.results.add({ hash, ...result }));

    return (
        <AppBar className={"bg-primary"}>
            <ButtonBar className={"p-2"}>
                <BackButton type={ButtonType.PRIMARY} icon={mdiArrowLeft}>
                    Back to Editor
                </BackButton>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-white"}>{useName()}</p>
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
