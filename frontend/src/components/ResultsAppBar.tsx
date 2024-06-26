import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import { bind, shareLatest } from "@react-rxjs/core";
import { liveQuery } from "dexie";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Subject, switchMap } from "rxjs";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";
import { useSubscribe } from "../hooks/UseSubscribe";
import { E3Request, toE3Object } from "../model/E3Request";
import { Model, currentProject$, hash$ } from "../model/Model";
import { db } from "../model/db";
import { download } from "../util/DownloadFile";
import AppBar from "./AppBar";
import { Button, ButtonType } from "./Button";
import ButtonBar from "./ButtonBar";
import HelpButtons from "./HelpButtons";

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
    shareLatest(),
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
                <Button icon={mdiArrowLeft} onClick={() => navigate("/editor")}>
                    Back to Editor
                </Button>
                <Button icon={mdiContentSave} onClick={() => saveClick$.next()}>
                    Save
                </Button>
                <Button icon={mdiFileDownload} onClick={() => pdfClick$.next()}>
                    Export PDF
                </Button>
                <Button icon={mdiTableArrowDown} onClick={() => saveClick$.next()}>
                    Export CSV
                </Button>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-white"}>{Model.useName()}</p>
                <div className={"pl-4"}>
                    <Button
                        type={ButtonType.PRIMARY_INVERTED}
                        icon={mdiPlay}
                        iconSide={"right"}
                        onClick={() => runClick$.next()}
                    >
                        Run
                    </Button>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
