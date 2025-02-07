import { Subscribe } from "@react-rxjs/core";
import ConfirmationModal from "components/modal/ConfirmationModal";
import MessageModal from "components/modal/MessageModal";
import { Effect } from "effect";
import { resetToDefaultProject } from "effect/DefaultProject";
import { sProject$ } from "model/Model";
import { DexieService } from "model/db";
import Index from "pages/Index";
import Editor from "pages/editor/Editor";
import Results from "pages/results/Results";
import { Route, Routes } from "react-router-dom";
import { BlccRuntime } from "util/runtime";

/**
 * Load the project from the database and put into model or create default project if not project is found.
 */
const loadProject = Effect.gen(function* () {
    const db = yield* DexieService;

    // Get project or default project if it is undefined
    const project = yield* db.getProject().pipe(Effect.catchTag("UndefinedError", () => resetToDefaultProject));
    yield* Effect.log(`Retrieving project ID: ${project.id}`);

    // Load project into model
    sProject$.next(project);
}).pipe(Effect.withSpan("Load Project Or Create Default"));

// Run loading
BlccRuntime.runPromise(loadProject);

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
