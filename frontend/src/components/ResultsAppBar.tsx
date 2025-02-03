import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiLoading, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import Icon from "@mdi/react";
import { Subscribe } from "@react-rxjs/core";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { Effect } from "effect";
import { Model } from "model/Model";
import { ResultModel } from "model/ResultModel";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Subject } from "rxjs";
import { downloadBlccFile, downloadPdf } from "util/DownloadFile";

const csvClick$ = new Subject<void>();

export default function ResultsAppBar() {
    const navigate = useNavigate();

    /*    useSubscribe(
        csvClick$.pipe(
            withLatestFrom(
                lccRows,
                lccBaseline,
                npvCosts,
                lccResourceRows,
                npvComparison,
                altNPV,
                resourceUsage,
                npvAll,
            ),
        ),
        ([_, lccRows, lccBaseline, npvCosts, lccResourceRows, npvComparison, altNPV, resourceUsage, npvAll]) => {
            const summary = { lccRows, lccBaseline, npvCosts, lccResourceRows };
            const annual = { npvComparison, npvAll };
            const altResults = { altNPV, resourceUsage };
            // Trigger CSV download
            const link = document.createElement("a");
            const csvData = CSVDownload(project, summary, annual, altResults);
            const csvBlob = new Blob([csvData.join("\n")], { type: "text/csv" });
            const url = window.URL.createObjectURL(csvBlob);
            link.href = url;
            link.download = `${project?.[0]?.name}.csv`; // Set the desired file name
            link.click();
            window.URL.revokeObjectURL(url); // Clean up the URL object
        },
    );*/

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <ButtonBar className={"p-2"}>
                <Button icon={mdiArrowLeft} onClick={() => navigate("/editor")}>
                    Back to Editor
                </Button>
                <Button icon={mdiContentSave} onClick={() => Effect.runPromise(downloadBlccFile)}>
                    Save
                </Button>
                <Button icon={mdiFileDownload} onClick={() => Effect.runPromise(downloadPdf)}>
                    Export PDF
                </Button>
                <Button icon={mdiTableArrowDown} onClick={() => csvClick$.next()}>
                    Export CSV
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
