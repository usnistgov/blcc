import AppBar from "./AppBar";
import { useAlternativeIDs, useCostIDs } from "../model/Model";
import { from, map, sample } from "rxjs";
import { liveQuery } from "dexie";
import { db } from "../model/db";
import Icon from "@mdi/react";
import { mdiCheck, mdiWindowClose } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { useSubscribe } from "../hooks/UseSubscribe";
import { useNavigate } from "react-router-dom";
import { guard } from "../util/Operators";

// Signal for when an error message is click to navigate to error location
const [errorClick$, errorClick] = createSignal();

// The first error in the database to display to the user, or undefined if there are no errors
const [useError, error$] = bind(from(liveQuery(() => db.errors.limit(1).first())), undefined);

// The number of errors after the first so we can display how many total errors there are
const [useExtraErrorCount] = bind(
    from(liveQuery(() => db.errors.count())).pipe(map((count) => (count - 1 < 0 ? 0 : count - 1))),
    0
);

// True if the project is valid, otherwise false
const [isValid] = bind(error$.pipe(map((error) => error === undefined)), true);

/**
 * A bar that displays some overview statistics and status of the current project.
 */
export default function Statistics() {
    // Navigates to page with the currently displaying error
    const navigate = useNavigate();
    useSubscribe(error$.pipe(sample(errorClick$), guard()), (error) => navigate(error.url), [navigate]);

    // Use hooks
    const valid = isValid();
    const error = useError();
    const extraErrorCount = useExtraErrorCount();

    return (
        <AppBar
            type={"footer"}
            className={"h-fit place-items-center border-t border-base-light bg-base-lightest text-sm"}
        >
            {/* Some general statistics about the project */}
            <div className={"flex flex-row divide-x divide-base-light"}>
                <p className={"px-4"}>{`Alternatives ${useAlternativeIDs().length}`}</p>
                <p className={"px-4"}>{`Costs ${useCostIDs().length}`}</p>
            </div>

            {/*
             * Displays whether the current project can be run by E3 or not.
             */}
            <div className={"flex cursor-pointer flex-row gap-2"} onClick={errorClick}>
                {/* The first error in the project */}
                <p className={"select-none"}>{!valid && `${error?.id}: ${error?.messages[0]}`}</p>

                {/* The total number of errors minus the first in the entire project */}
                {extraErrorCount > 0 && <p className={"select-none"}>Plus {extraErrorCount} more...</p>}

                {/* An icon denoting whether the project is valid or invalid */}
                <Icon
                    className={"mx-2 " + (valid ? "text-success" : "text-error")}
                    path={valid ? mdiCheck : mdiWindowClose}
                    size={0.8}
                />
            </div>
        </AppBar>
    );
}
