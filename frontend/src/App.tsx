import { Subscribe } from "@react-rxjs/core";
import ConfirmationModal from "components/modal/ConfirmationModal";
import MessageModal from "components/modal/MessageModal";
import Index from "pages/Index";
import Editor from "pages/editor/Editor";
import Results from "pages/results/Results";
import { Route, Routes } from "react-router-dom";

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
                <Route
                    path={"/results/*"}
                    element={
                        <Subscribe>
                            <Results />
                        </Subscribe>
                    }
                />
            </Routes>
        </div>
    );
}
