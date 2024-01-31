import { Subscribe } from "@react-rxjs/core";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CostNavigation from "./components/CostNavigation";
import EditorAppBar from "./components/EditorAppBar";
import Navigation from "./components/Navigation";
import ResultNavigation from "./components/ResultNavigation";
import ResultsAppBar from "./components/ResultsAppBar";
import Statistics from "./components/Statistics";
import UrlParameters from "./components/UrlParameters";
import { project$ } from "./model/Project";
import AlternativeSummary from "./pages/editor/AlternativeSummary";
import Alternatives from "./pages/editor/Alternatives";
import Cost from "./pages/editor/Cost";
import GeneralInformation from "./pages/editor/GeneralInformation";
import AlternativeResults from "./pages/results/AlternativeResults";
import AnnualResults from "./pages/results/AnnualResults";
import Inputs from "./pages/results/Inputs";
import Summary from "./pages/results/Summary";
import { bar, line, pie, zoom } from "billboard.js";
import "billboard.js/dist/billboard.css";
import Index from "./pages/Index";
import PageWrapper from "./components/PageWrapper";

//FIXME: needed to force load the project stream
project$.subscribe(console.log);

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
                                    <Route index element={<Inputs />} />
                                    <Route path={"alternative"} element={<AlternativeResults />} />
                                    <Route path={"annual"} element={<AnnualResults />} />
                                    <Route path={"summary"} element={<Summary />} />
                                </Route>
                            </Route>
                        </Routes>
                    </div>

                    <Routes>
                        <Route path={"/editor/*"} element={<Statistics />} />
                        <Route path={"/results/*"} element={<></>} /> {/* Gets rid of rout error */}
                    </Routes>
                </div>
            </BrowserRouter>
        </Subscribe>
    );
}
