import ResultsAppBar from "components/ResultsAppBar";
import ResultNavigation from "components/navigation/ResultNavigation";
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

                <Routes>
                    <Route index element={<Summary />} />
                    <Route path={"alternative"} element={<AlternativeResults />} />
                    <Route path={"annual"} element={<AnnualResults />} />
                    <Route path={"inputs"} element={<Inputs />} />
                </Routes>
            </div>
        </>
    );
}
