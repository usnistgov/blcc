import { mdiPlay } from "@mdi/js";
import ResultsAppBar from "components/ResultsAppBar";
import { Button, ButtonType } from "components/input/Button";
import ResultNavigation from "components/navigation/ResultNavigation";
import { ResultModel } from "model/ResultModel";
import AlternativeResults from "pages/results/AlternativeResults";
import AnnualResults from "pages/results/AnnualResults";
import Inputs from "pages/results/Inputs";
import Summary from "pages/results/Summary";
import { Route, Routes } from "react-router-dom";

export default function Results() {
    return (
        <>
            <ResultsAppBar />

            <div className={"flex h-full overflow-hidden"}>
                <ResultNavigation />

                {(ResultModel.noResult() && (
                    <div className={"w-full p-8 flex flex-col items-center text-center text-base-dark gap-4"}>
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
                            <p className={"text-lg ml-2"}>the project to obtain results.</p>
                        </div>
                    </div>
                )) || (
                    <Routes>
                        <Route index element={<Summary />} />
                        <Route path={"alternative"} element={<AlternativeResults />} />
                        <Route path={"annual"} element={<AnnualResults />} />
                        <Route path={"inputs"} element={<Inputs />} />
                    </Routes>
                )}
            </div>
        </>
    );
}
