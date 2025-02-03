import { Subscribe } from "@react-rxjs/core";
import { checkDefaultProject } from "blcc-format/effects";
import ConfirmationModal from "components/modal/ConfirmationModal";
import MessageModal from "components/modal/MessageModal";
import { Effect, Option } from "effect";
import { sProject$ } from "model/Model";
import { getProject } from "model/db";
import Index from "pages/Index";
import Editor from "pages/editor/Editor";
import Results from "pages/results/Results";
import { Route, Routes } from "react-router-dom";

Effect.runPromise(
    Effect.gen(function* () {
        const optionDefaultProject = yield* checkDefaultProject;

        if (Option.isSome(optionDefaultProject)) {
            sProject$.next(Option.getOrThrow(optionDefaultProject));
            return;
        }

        const project = yield* getProject(1);

        yield* Effect.log("Retrieving project", project);

        if (project !== undefined) sProject$.next(project);
    }),
);

/**
 * Component containing the top level elements and router for the entire application.
 */
export default function App() {
    return (
        <div className={"flex h-full flex-col"}>
            {/*
             * Various modals that need to appear over everything else. They can be activated by calling a
             * stream operator
             */}
            <MessageModal />
            <ConfirmationModal />

            {/* Top level pages */}
            <Routes>
                <Route
                    index
                    element={
                        <Subscribe>
                            <Index />
                        </Subscribe>
                    }
                />
                <Route path={"/editor/*"} element={<Editor />} />
                <Route path={"/results/*"} element={<Results />} />
            </Routes>
        </div>
    );
}
