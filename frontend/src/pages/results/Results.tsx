import { Route, Routes } from "react-router-dom";
import ResultsAppBar from "../../components/ResultsAppBar";
import ResultNavigation from "../../components/navigation/ResultNavigation";
import Inputs from "./Inputs";
import AnnualResults from "./AnnualResults";
import AlternativeResults from "./AlternativeResults";
import Summary from "./Summary";

export default function Results() {
    return <>
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
} 
