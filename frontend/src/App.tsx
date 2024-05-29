import { Subscribe } from "@react-rxjs/core";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import { combineLatest } from "rxjs";
import { defaultReleaseYear$ } from "./model/Model";
import { createSignal } from "@react-rxjs/utils";
import messageModal, { type Message } from "./components/modal/MessageModal";
import Editor from "./pages/editor/Editor";
import Results from "./pages/results/Results";

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

const [message$, showMessage] = createSignal<Message>();
const { component: MessageModal } = messageModal(message$);

export { showMessage, Results };

export default function App() {
    return (
        <Subscribe>
            <BrowserRouter>
                <div className={"flex h-full flex-col"}>
                    <MessageModal />

                    {/* App bars */}
                    <Routes>
                        <Route index element={<Index />} />
                        <Route path={"/editor/*"} element={<Editor />} />
                        <Route path={"/results/*"} element={<Results />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </Subscribe>
    );
}
