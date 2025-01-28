import { mdiArrowLeft, mdiContentSave, mdiFileDownload, mdiLoading, mdiPlay, mdiTableArrowDown } from "@mdi/js";
import Icon from "@mdi/react";
import { pdf } from "@react-pdf/renderer";
import { Alternative, Cost, Project } from "blcc-format/Format";
import AppBar from "components/AppBar";
import ButtonBar from "components/ButtonBar";
import HelpButtons from "components/HelpButtons";
import { Button, ButtonType } from "components/input/Button";
import { useSubscribe } from "hooks/UseSubscribe";
import * as htmlToImage from "html-to-image";
import { db } from "model/db";
import { Model, costs$, useAlternatives, useProject } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Subject, withLatestFrom } from "rxjs";
import { download } from "util/DownloadFile";
import Pdf from "./Pdf";

import {
    altNPV,
    lccBaseline,
    lccResourceRows,
    lccRows,
    npvAll,
    npvComparison,
    npvCosts,
    resourceUsage
} from "./allResultStreams";
import CSVDownload from "./CSVDownload";

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

    const generatePdf = useCallback(
        (_, lccRows, lccBaseline, npvCosts, lccResourceRows, npvComparison, altNPV, resourceUsage, NpvAll) => {
            const pdfGraphs = document.getElementsByClassName("result-graph");

            // if (pdfGraphs.length === 0) return;

            const promises = [...pdfGraphs].map((graph) =>
                htmlToImage.toPng(graph as HTMLElement).then((graphSrc) => graphSrc)
            );

            Promise.all(promises).then((graphSources) => {
                console.log(graphSources);
                const blob = pdf(
                    <Pdf
                        project={project as Project}
                        alternatives={alternatives as Alternative[]}
                        costs={costs as Cost[]}
                        summary={{ lccRows, lccBaseline, npvCosts, lccResourceRows }}
                        annual={{ npvComparison, NpvAll }}
                        altResults={{ altNPV, resourceUsage }}
                        graphSources={(graphSources as string[]) || []}
                    />
                ).toBlob();

                blob.then((blob: Blob | MediaSource) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "BLCC Report.pdf";
                    link.click();
                });
            });
        },
        [project]
    );

    useSubscribe(
        pdfClick$.pipe(
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
            console.log("clicked");
            generatePdf(
                _,
                lccRows,
                lccBaseline,
                npvCosts,
                lccResourceRows,
                npvComparison,
                altNPV,
                resourceUsage,
                npvAll
            );
        }
    ); //TODO Create and download PDF
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
    );
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
