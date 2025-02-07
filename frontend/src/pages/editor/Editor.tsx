import { Subscribe } from "@react-rxjs/core";
import EditorAppBar from "components/EditorAppBar";
import PageWrapper from "components/PageWrapper";
import Statistics from "components/Statistics";
import CostNavigation from "components/navigation/CostNavigation";
import Navigation from "components/navigation/Navigation";
import { AnimatePresence } from "framer-motion";
import { Sync } from "hooks/useParamSync";
import AlternativeSummary from "pages/editor/AlternativeSummary";
import Cost from "pages/editor/Cost";
import Alternatives from "pages/editor/alternative/Alternatives";
import GeneralInformation from "pages/editor/general_information/GeneralInformation";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

export default function Editor() {
    const location = useLocation();

    return (
        <>
            <EditorAppBar />

            <div className={"flex h-full overflow-hidden"}>
                <Routes location={location}>
                    <Route path={"*"} element={<Navigation />} />
                </Routes>

                <AnimatePresence mode={"wait"}>
                    <Routes
                        location={location}
                        key={location.pathname.startsWith("/editor/alternative/") ? "cost-navigation" : "navigation"}
                    >
                        <Route path={"alternative/:alternativeID/*"} element={<CostNavigation />} />
                    </Routes>
                </AnimatePresence>

                <AnimatePresence mode={"wait"}>
                    <Routes location={location} key={location.key}>
                        <Route
                            element={
                                <Subscribe>
                                    <PageWrapper />
                                </Subscribe>
                            }
                        >
                            <Route index element={<GeneralInformation />} />
                            <Route path={"alternative"}>
                                <Route index element={<AlternativeSummary />} />
                                <Route
                                    path={":alternativeID/cost/:costID"}
                                    element={
                                        <Subscribe fallback={<Sync />}>
                                            <Cost />
                                        </Subscribe>
                                    }
                                />
                                <Route path={":alternativeID"} element={<Alternatives />} />
                            </Route>
                        </Route>
                    </Routes>
                </AnimatePresence>
            </div>

            <Statistics />
        </>
    );
}
