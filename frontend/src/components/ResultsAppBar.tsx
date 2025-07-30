import {
    mdiArrowLeft,
    mdiCodeJson,
    mdiCommentAlertOutline,
    mdiContentSave,
    mdiFileDownload,
    mdiLoading,
    mdiPlay,
    mdiTableArrowDown,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Subscribe } from "@react-rxjs/core";
import { downloadCsv, downloadDebugInfo, downloadE3Request, downloadPdf } from "blcc-format/DownloadFile";
import AppBar, { AppBarBetaTag } from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { Effect } from "effect";
import { useSubscribe } from "hooks/UseSubscribe";
import { EditorModel } from "model/EditorModel";
import { Model } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { useNavigate } from "react-router-dom";
import { E3ObjectService } from "services/E3ObjectService";
import { BlccRuntime } from "util/runtime";
import SaveAsModal, { showSaveAsModal } from "./modal/SaveAsModal";
import PdfLoadingModal, { PdfLoadingModel } from "./modal/PdfLoadingModal";

export default function ResultsAppBar() {
    const navigate = useNavigate();
    const noResult = ResultModel.noResult();

    useSubscribe(EditorModel.saveClick$.pipe(showSaveAsModal()));

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <Subscribe>
                <PdfLoadingModal />
            </Subscribe>
            <Subscribe>
                <SaveAsModal />
            </Subscribe>
            <ButtonBar className={"p-2"}>
                <Button icon={mdiArrowLeft} onClick={() => navigate("/editor")}>
                    Back to Editor
                </Button>
                <Button icon={mdiContentSave} onClick={() => EditorModel.saveClick()}>
                    Save
                </Button>
                <Button
                    icon={mdiFileDownload}
                    onClick={() => {
                        if (noResult) {
                            ResultModel.setDownloadError(true);
                        } else {
                            PdfLoadingModel.setShowLoadingModal(true);
                            BlccRuntime.runPromise(downloadPdf);
                        }
                    }}
                >
                    Export PDF
                </Button>
                <Button
                    icon={mdiTableArrowDown}
                    onClick={() => {
                        if (noResult) {
                            ResultModel.setDownloadError(true);
                        } else {
                            BlccRuntime.runPromise(downloadCsv);
                        }
                    }}
                >
                    Export CSV
                </Button>
                <Button
                    icon={mdiCodeJson}
                    onClick={() =>
                        BlccRuntime.runPromise(
                            Effect.gen(function* () {
                                const e3ObjectService = yield* E3ObjectService;
                                yield* e3ObjectService.createE3Object.pipe(Effect.andThen(downloadE3Request));
                            }),
                        )
                    }
                >
                    E3
                </Button>
                <Button
                    type={ButtonType.PRIMARY}
                    icon={mdiCommentAlertOutline}
                    onClick={() => {
                        BlccRuntime.runPromise(
                            Effect.gen(function* () {
                                const e3ObjectService = yield* E3ObjectService;
                                yield* e3ObjectService.createE3Object.pipe(Effect.andThen(downloadDebugInfo));
                            }),
                        );
                    }}
                >
                    Debug
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
            <p className={"font-bold text-white"}>{name}</p>
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
                    <AppBarBetaTag />
                </div>
                {loading && <Icon className={"animate-spin text-off-white"} path={mdiLoading} size={1} />}
                {!loading && timestamp && (
                    <p className={"text-base-lighter"}>Last run at {timestamp.toLocaleString()}</p>
                )}
            </div>
        </div>
    );
}
