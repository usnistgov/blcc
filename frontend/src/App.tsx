import { Subscribe } from "@react-rxjs/core";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import EditorAppBar from "./components/EditorAppBar";
import Statistics from "./components/Statistics";
import { bar, line, pie, zoom } from "billboard.js";
import "billboard.js/dist/billboard.css";
import PageWrapper from "./components/PageWrapper";
import GeneralInformation from "./pages/editor/GeneralInformation";
import { liveQuery } from "dexie";
import { db } from "./model/db";
import { Version } from "./blcc-format/Verison";
import {
    DollarMethod,
    EmissionsRateScenario,
    SocialCostOfGhgScenario
} from "./blcc-format/Format";
import { Country } from "./constants/LOCATION";
import Index from "./pages/Index";
import Navigation from "./components/navigation/Navigation";
import AlternativeSummary from "./pages/editor/AlternativeSummary";
import Cost from "./pages/editor/Cost";
import UrlParameters from "./components/UrlParameters";
import Alternatives from "./pages/editor/Alternatives";
import CostNavigation from "./components/navigation/CostNavigation";
import ResultsAppBar from "./components/ResultsAppBar";
import ResultNavigation from "./components/navigation/ResultNavigation";
import Inputs from "./pages/results/Inputs";
import AlternativeResults from "./pages/results/AlternativeResults";
import AnnualResults from "./pages/results/AnnualResults";
import Summary from "./pages/results/Summary";
import { combineLatest } from "rxjs";
import { defaultReleaseYear$ } from "./model/Model";

//FIXME: needed to force load the project stream
//project$.subscribe(console.log);

/**
 * Initializes all Billboard.js elements.
 */
function initializeBillboardJS() {
    bar();
    pie();
    line();
    zoom();
}
initializeBillboardJS();

const defaultProject$ = liveQuery(() => db.projects.where("id").equals(1).first());
combineLatest([defaultProject$, defaultReleaseYear$]).subscribe(([p, releaseYear]) => {
    if (p !== undefined) return;

    db.projects.add({
        version: Version.V1,
        name: "Untitled Project",
        dollarMethod: DollarMethod.CONSTANT,
        constructionPeriod: 0,
        location: {
            country: Country.USA
        },
        alternatives: [],
        costs: [],
        ghg: {
            socialCostOfGhgScenario: SocialCostOfGhgScenario.SCC,
            emissionsRateScenario: EmissionsRateScenario.BASELINE
        },
        releaseYear
    });
});

export default function App() {
    return (
        <Subscribe>
            <BrowserRouter>
                <div className={"flex h-full flex-col"}>
                    {/* App bars */}
                    <Routes>
                        <Route path={"/editor/*"} element={<EditorAppBar />} />
                        <Route path={"/results/*"} element={<ResultsAppBar />} />
                    </Routes>

                    <div className={"flex h-full overflow-hidden"}>
                        {/* Navigation */}
                        <Routes>
                            <Route index element={<Index />} />
                            <Route path={"/editor/*"} element={<Navigation />}>
                                <Route path={"alternative/:altID"}>
                                    <Route index path={"*"} element={<CostNavigation />} />
                                </Route>
                            </Route>
                            <Route path={"/results/*"} element={<ResultNavigation />} />
                        </Routes>

                        {/* Pages */}
                        <Routes>
                            <Route element={<PageWrapper />}>
                                <Route path={"/editor"}>
                                    <Route index element={<GeneralInformation />} />
                                    <Route path={"alternative"}>
                                        <Route index element={<AlternativeSummary />} />
                                        <Route
                                            path={":alternativeID/cost/:costID"}
                                            element={
                                                <UrlParameters>
                                                    <Cost />
                                                </UrlParameters>
                                            }
                                        />
                                        <Route
                                            path={":alternativeID"}
                                            element={
                                                <UrlParameters>
                                                    <Alternatives />
                                                </UrlParameters>
                                            }
                                        />
                                    </Route>
                                </Route>
                                <Route path={"/results"}>
                                    <Route index element={<Summary />} />
                                    <Route path={"alternative"} element={<AlternativeResults />} />
                                    <Route path={"annual"} element={<AnnualResults />} />
                                    <Route path={"inputs"} element={<Inputs />} />
                                </Route>
                            </Route>
                        </Routes>
                    </div>

                    <Routes>
                        <Route path={"/editor/*"} element={<Statistics />} />
                        <Route path={"/results/*"} element={<></>} /> Gets rid of rout error
                    </Routes>
                </div>
            </BrowserRouter>
        </Subscribe>
    );
}
