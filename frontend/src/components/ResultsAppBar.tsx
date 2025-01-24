import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiLoading, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import Icon from "@mdi/react";
import type { Alternative, Cost, Project } from "blcc-format/Format";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { useSubscribe } from "hooks/UseSubscribe";
import { Model, costs$, useAlternatives, useProject } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { db } from "model/db";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Subject } from "rxjs";
import { download } from "util/DownloadFile";

const pdfClick$ = new Subject<void>();
const saveClick$ = new Subject<void>();
const csvClick$ = new Subject<void>();

export default function ResultsAppBar() {
    const navigate = useNavigate();
    const project: Project = useProject();
    const alternatives: Alternative[] = useAlternatives();
    let costs: Cost[] = [];
    costs$.subscribe((data) => {
        costs = data;
    });

    useSubscribe(pdfClick$, () => {}); //TODO Create and download PDF
    useSubscribe(saveClick$, async () => download(await db.export(), "download.blcc"));
    //TODO: change download filename

    const loading = ResultModel.isLoading();
    const timestamp = ResultModel.useTimestamp();

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
                <Button icon={mdiTableArrowDown} onClick={() => csvClick$.next()}>
                    Export CSV
                </Button>
            </ButtonBar>
            <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
                <p className={"text-white"}>{Model.name.use()}</p>
                <div className={"flex flex-row items-center gap-4"}>
                    <div className={"pl-4"}>
                        <Button
                            type={ButtonType.PRIMARY_INVERTED}
                            icon={mdiPlay}
                            iconSide={"right"}
                            onClick={() => ResultModel.Actions.run()}
                            disabled={loading}
                        >
                            Run
                        </Button>
                    </div>
                    {loading && <Icon className={"text-off-white animate-spin"} path={mdiLoading} size={1} />}
                    {!loading && timestamp && (
                        <p className={"text-base-lighter"}>Last run at {timestamp.toLocaleString()}</p>
                    )}
                </div>
            </div>
            <HelpButtons />
        </AppBar>
    );
}
