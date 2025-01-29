import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiLoading, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import Icon from "@mdi/react";
import type { Alternative, Cost, Project } from "blcc-format/Format";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { Effect } from "effect";
import { useSubscribe } from "hooks/UseSubscribe";
import { Model, costs$, useAlternatives, useProject } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { db, exportDB, getAlternatives, getCosts, getProject, hashCurrent } from "model/db";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Subject, withLatestFrom } from "rxjs";
import { download, downloadBlccFile } from "util/DownloadFile";
import CSVDownload from "./CSVDownload";
import {
    altNPV,
    lccBaseline,
    lccResourceRows,
    lccRows,
    npvAll,
    npvComparison,
    npvCosts,
    resourceUsage,
} from "./allResultStreams";

const pdfClick$ = new Subject<void>();
const csvClick$ = new Subject<void>();

const downloadCsv = Effect.gen(function* () {
    const project = yield* getProject(1);
    const alternatives = yield* getAlternatives;

    if (project === undefined) return;
});

export default function ResultsAppBar() {
    const navigate = useNavigate();
    //const project: Project = useProject();
    //const alternatives: Alternative[] = useAlternatives();

    /*    useSubscribe(pdfClick$, () => {}); //TODO Create and download PDF
    useSubscribe(
        csvClick$.pipe(
            withLatestFrom(
                lccRows,
                lccBaseline,
                npvCosts,
                lccResourceRows,
                npvComparison,
                altNPV,
                resourceUsage,
                npvAll
            )
        ),
        ([_, lccRows, lccBaseline, npvCosts, lccResourceRows, npvComparison, altNPV, resourceUsage, npvAll]) => {
            const summary = { lccRows, lccBaseline, npvCosts, lccResourceRows };
            const annual = { npvComparison, npvAll };
            const altResults = { altNPV, resourceUsage };
            // Trigger CSV download
            const link = document.createElement("a");
            const csvData = CSVDownload(project, alternatives, summary, annual, altResults);
            const csvBlob = new Blob([csvData.join("\n")], { type: "text/csv" });
            const url = window.URL.createObjectURL(csvBlob);
            link.href = url;
            link.download = `${project.name}.csv`; // Set the desired file name
            link.click();
            window.URL.revokeObjectURL(url); // Clean up the URL object
        }
    );*/

    const loading = ResultModel.isLoading();
    const timestamp = ResultModel.useTimestamp();

    const name = Model.name.use();

    return (
        <AppBar className={"z-50 bg-primary shadow-lg"}>
            <ButtonBar className={"p-2"}>
                <Button icon={mdiArrowLeft} onClick={() => navigate("/editor")}>
                    Back to Editor
                </Button>
                <Button icon={mdiContentSave} onClick={() => Effect.runPromise(downloadBlccFile)}>
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
            <HelpButtons />
        </AppBar>
    );
}
