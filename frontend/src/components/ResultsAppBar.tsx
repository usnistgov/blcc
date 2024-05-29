import React from "react";
import ButtonBar from "./ButtonBar";
import { Button, ButtonType } from "./Button";
import AppBar from "./AppBar";
import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { useSubscribe } from "../hooks/UseSubscribe";
import HelpButtons from "./HelpButtons";
import { E3Request, toE3Object } from "../model/E3Request";
import { Subject, switchMap } from "rxjs";
import { bind, shareLatest } from "@react-rxjs/core";
import { currentProject$, hash$, useName } from "../model/Model";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";
import { db } from "../model/db";
import { liveQuery } from "dexie";
import { download } from "../util/DownloadFile";

const runClick$ = new Subject<void>();
const pdfClick$ = new Subject<void>();
const saveClick$ = new Subject<void>();
const csvClick$ = new Subject<void>();

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
    tap(console.log),
    E3Request(),
    tap(console.log),
    shareLatest()
);

export default function ResultsAppBar() {
    const navigate = useNavigate();

    useSubscribe(e3Result$.pipe(withLatestFrom(hash$)), ([result, hash]) => db.results.add({ hash, ...result }));
    useSubscribe(pdfClick$, () => console.log("TODO: save pdf"));
    useSubscribe(csvClick$, () => console.log("TODO: save csv"));
    useSubscribe(saveClick$, async () => download(await db.export(), "download.blcc"));
    //TODO: change download filename

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <ButtonBar className={"p-2"}>
                <Button icon={mdiArrowLeft} onClick={() => navigate("/editor")}>Back to Editor</Button>
                <Button icon={mdiContentSave} onClick={() => saveClick$.next()}>Save</Button>
                <Button icon={mdiFileDownload} onClick={() => pdfClick$.next()}>Export PDF</Button>
                <Button icon={mdiTableArrowDown} onClick={() => saveClick$.next()}>Export CSV</Button>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-white"}>{useName()}</p>
                <div className={"pl-4"}>
                    <Button type={ButtonType.PRIMARY_INVERTED} icon={mdiPlay} iconSide={"right"} onClick={() => runClick$.next()}>
                        Run
                    </Button>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
