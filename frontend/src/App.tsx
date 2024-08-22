import { Subscribe } from "@react-rxjs/core";
import { defaultProject } from "blcc-format/DefaultProject";
import ConfirmationModal from "components/modal/ConfirmationModal";
import MessageModal from "components/modal/MessageModal";
import { liveQuery } from "dexie";
import { Model } from "model/Model";
import { db } from "model/db";
import Index from "pages/Index";
import Editor from "pages/editor/Editor";
import Results from "pages/results/Results";
import { useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { combineLatest } from "rxjs";

/**
 * Component containing the top level elements and router for the entire application.
 */
export default function App() {
    useMemo(() => {
        const defaultProject$ = liveQuery(() => db.projects.where("id").equals(1).first());
        combineLatest([defaultProject$, Model.defaultReleaseYear$]).subscribe(([p, releaseYear]) => {
            if (p !== undefined) return;

            db.projects.add(defaultProject(releaseYear));
        });
    }, []);

    return (
        <Subscribe>
            <BrowserRouter>
                <div className={"flex h-full flex-col"}>
                    {/*
                     * Various modals that need to appear over everything else. They can be activated by calling a
                     * stream operator
                     */}
                    <MessageModal />
                    <ConfirmationModal />

                    {/* Top level pages */}
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
