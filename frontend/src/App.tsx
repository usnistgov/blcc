import { Subscribe } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import messageModal, { type Message } from "components/modal/MessageModal";
import { liveQuery } from "dexie";
import { Model } from "model/Model";
import { db } from "model/db";
import Index from "pages/Index";
import Editor from "pages/editor/Editor";
import Results from "pages/results/Results";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { combineLatest } from "rxjs";
import { defaultProject } from "./blcc-format/DefaultProject";

const defaultProject$ = liveQuery(() => db.projects.where("id").equals(1).first());
combineLatest([defaultProject$, Model.defaultReleaseYear$]).subscribe(([p, releaseYear]) => {
    if (p !== undefined) return;

    db.projects.add(defaultProject(releaseYear));
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
