import { mdiPlay } from "@mdi/js";
import { Subscribe } from "@react-rxjs/core";
import ResultsAppBar from "components/ResultsAppBar";
import { Button, ButtonType } from "components/input/Button";
import ResultNavigation from "components/navigation/ResultNavigation";
import { ResultModel } from "model/ResultModel";
import AlternativeResults from "pages/results/AlternativeResults";
import AnnualResults from "pages/results/AnnualResults";
import Inputs from "pages/results/Inputs";
import Summary from "pages/results/Summary";
import { Outlet, Route, Routes } from "react-router-dom";
import { Alert } from "antd";
import { delay } from "rxjs";

/**
 * Top level page that displays the E3 results of the project.
 */
export default function Results() {
    const noResult = ResultModel.noResult();
    const hasError = ResultModel.hasError();
    const hasPdfError = ResultModel.hasPdfError();

    return (
        <>
            <ResultsAppBar />

            <div className={"flex h-full overflow-hidden"}>
                <ResultNavigation />
                {(hasError && (
                    <div className="flex w-full flex-col items-center p-6">
                        <Alert
                            message="Error: E3 could not evaluate your request."
                            description="Please check your inputs in the editor and try again."
                            type="error"
                            closable
                            className="w-1/3"
                        />
                    </div>
                )) ||
                    (noResult && (
                        // If there are no results, display a message telling the user to run the project.
                        <div className={"flex w-full flex-col items-center gap-4 p-8 text-center text-base-dark"}>
                            {hasPdfError && (
                                <Alert
                                    message="Error: must run results before generating PDF."
                                    description="Please run the results before exporting to PDF."
                                    type="error"
                                    onClose={() => {
                                        setTimeout(() => ResultModel.setPdfError(false), 500);
                                    }}
                                    closable
                                    className="w-1/3"
                                />
                            )}
                            <p className={"text-2xl"}>No Results to Display</p>
                            <div className={"flex flex-row"}>
                                <Button
                                    type={ButtonType.PRIMARY_INVERTED}
                                    icon={mdiPlay}
                                    iconSide={"right"}
                                    onClick={() => ResultModel.Actions.run()}
                                >
                                    Run
                                </Button>
                                <p className={"ml-2 text-lg"}>the project to obtain results.</p>
                            </div>
                        </div>
                    )) || (
                        // If we do have results, display the corresponding route page.
                        <Routes>
                            <Route
                                element={
                                    <Subscribe>
                                        <Outlet />
                                    </Subscribe>
                                }
                            >
                                <Route index element={<Summary />} />
                                <Route path={"alternative"} element={<AlternativeResults />} />
                                <Route path={"annual"} element={<AnnualResults />} />
                                <Route path={"inputs"} element={<Inputs />} />
                            </Route>
                        </Routes>
                    )}
            </div>
        </>
    );
}
