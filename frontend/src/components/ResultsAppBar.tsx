import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import { bind, shareLatest } from "@react-rxjs/core";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { liveQuery } from "dexie";
import { useSubscribe } from "hooks/UseSubscribe";
import { E3Request, toE3Object } from "model/E3Request";
import { Model, currentProject$, hash$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { db } from "model/db";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Subject, switchMap } from "rxjs";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";
import { download } from "util/DownloadFile";

const runClick$ = new Subject<void>();
const pdfClick$ = new Subject<void>();
const saveClick$ = new Subject<void>();
const csvClick$ = new Subject<void>();

export default function ResultsAppBar() {
    const navigate = useNavigate();

    useSubscribe(ResultModel.e3Result$.pipe(withLatestFrom(hash$)), ([result, hash]) =>
        db.results.add({ hash, ...result }),
    );
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
                        onClick={() => ResultModel.Actions.run()}
                    >
                        Run
                    </Button>
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
