import {
    mdiArrowLeft,
    mdiCodeJson,
    mdiContentSave,
    mdiFileDownload,
    mdiLoading,
    mdiPlay,
    mdiTableArrowDown,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Subscribe } from "@react-rxjs/core";
import { downloadBlccFile, downloadCsv, downloadE3Request, downloadPdf } from "blcc-format/DownloadFile";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { Effect } from "effect";
import { toE3ObjectEffect } from "model/E3Request";
import { EditorModel } from "model/EditorModel";
import { Model } from "model/Model";
import { ResultModel } from "model/ResultModel";
import React from "react";
import { useNavigate } from "react-router-dom";
import SaveAsModal from "./modal/SaveAsModal";

export default function ResultsAppBar() {
    const navigate = useNavigate();

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <Subscribe>
                <SaveAsModal />
            </Subscribe>
            <ButtonBar className={"p-2"}>
                <Button icon={mdiArrowLeft} onClick={() => navigate("/editor")}>
                    Back to Editor
                </Button>
                <Button icon={mdiContentSave} onClick={() => EditorModel.saveClick$.next()}>
                    Save
                </Button>
                <Button icon={mdiFileDownload} onClick={() => Effect.runPromise(downloadPdf)}>
                    Export PDF
                </Button>
                <Button icon={mdiTableArrowDown} onClick={() => Effect.runPromise(downloadCsv)}>
                    Export CSV
                </Button>
                <Button
                    icon={mdiCodeJson}
                    onClick={() => Effect.runPromise(toE3ObjectEffect.pipe(Effect.andThen(downloadE3Request)))}
                >
                    E3 Request
                </Button>
            </ButtonBar>
            <Subscribe>
                <CenterContent />
            </Subscribe>
            <HelpButtons />
        </AppBar>
    );
}

function CenterContent() {
    const loading = ResultModel.isLoading();
    const timestamp = ResultModel.useTimestamp();
    const name = Model.name.use();

    return (
        <div className={"flex flex-row place-items-center gap-4 divide-x-2 divide-white"}>
            <p className={"text-white"}>{name}</p>
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
                {loading && <Icon className={"animate-spin text-off-white"} path={mdiLoading} size={1} />}
                {!loading && timestamp && (
                    <p className={"text-base-lighter"}>Last run at {timestamp.toLocaleString()}</p>
                )}
            </div>
        </div>
    );
}
