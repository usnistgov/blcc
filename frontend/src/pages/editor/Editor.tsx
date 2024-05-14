import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import EditorAppBar from "../../components/EditorAppBar";
import PageWrapper from "../../components/PageWrapper";
import Statistics from "../../components/Statistics";
import CostNavigation from "../../components/navigation/CostNavigation";
import Navigation from "../../components/navigation/Navigation";
import AlternativeSummary from "./AlternativeSummary";
import Alternatives from "./Alternatives";
import Cost from "./Cost";
import GeneralInformation from "./GeneralInformation";

export default function Editor() {
    const location = useLocation();

    return (
        <>
            <EditorAppBar />

            <div className={"flex h-full overflow-hidden"}>
                <AnimatePresence mode={"wait"}>
                    <Routes location={location} key={location.key}>
                        <Route path={"*"} element={<Navigation />}>
                            <Route index />
                            <Route path={"alternative/:altID"}>
                                <Route index path={"*"} element={<CostNavigation />} />
                            </Route>
                        </Route>
                    </Routes>
                </AnimatePresence>

                <AnimatePresence mode={"wait"}>
                    <Routes location={location} key={location.key}>
                        <Route element={<PageWrapper />}>
                            <Route index element={<GeneralInformation />} />
                            <Route path={"alternative"}>
                                <Route index element={<AlternativeSummary />} />
                                <Route path={":alternativeID/cost/:costID"} element={<Cost />} />
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
