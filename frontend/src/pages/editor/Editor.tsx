import { Route, Routes, useLocation } from "react-router-dom";
import EditorAppBar from "../../components/EditorAppBar";
import Navigation from "../../components/navigation/Navigation";
import CostNavigation from "../../components/navigation/CostNavigation";
import PageWrapper from "../../components/PageWrapper";
import GeneralInformation from "./GeneralInformation";
import AlternativeSummary from "./AlternativeSummary";
import UrlParameters from "../../components/UrlParameters";
import Cost from "./Cost";
import Alternatives from "./Alternatives";
import Statistics from "../../components/Statistics";
import { match } from "ts-pattern";
import { isLoaded } from "../../model/Model";
import { AnimatePresence } from "framer-motion";

export default function Editor() {
    const loaded = isLoaded();
    const location = useLocation();

    console.log("Rendered", loaded)

    if (!loaded)
        return <></>

    return <>
        <EditorAppBar />

        <div className={"flex h-full overflow-hidden"}>
            <Routes>
                <Route path={"*"} element={<Navigation />} >
                    <Route index />
                    <Route path={"alternative/:altID"}>
                        <Route index path={"*"} element={<CostNavigation />} />
                    </Route>
                </Route>
            </Routes>

            <AnimatePresence mode={"wait"}>
                <Routes location={location} key={location.key}>
                    <Route element={<PageWrapper />}>
                        <Route index element={<GeneralInformation />} />
                        <Route path={"alternative"}>
                            <Route index element={<AlternativeSummary />} />
                            <Route
                                path={":alternativeID/cost/:costID"}
                                element={<Cost />}
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
                </Routes>
            </AnimatePresence>
        </div>

        <Statistics />
    </>
} 
