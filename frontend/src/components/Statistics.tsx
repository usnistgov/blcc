import { mdiCheck, mdiContentSaveAlert, mdiWindowClose } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Tooltip } from "antd";
import AppBar from "components/AppBar";
import { liveQuery } from "dexie";
import { useSubscribe } from "hooks/UseSubscribe";
import { useAlternativeIDs, useCostIDs, useIsDirty } from "model/Model";
import { db } from "model/db";
import { useNavigate } from "react-router-dom";
import { from, map, sample } from "rxjs";
import { guard } from "util/Operators";

// Signal for when an error message is click to navigate to error location
const [errorClick$, errorClick] = createSignal();

// The first error in the database to display to the user, or undefined if there are no errors
const [useError, error$] = bind(from(liveQuery(() => db.errors.limit(1).first())), undefined);

// The number of errors after the first so we can display how many total errors there are
const [useExtraErrorCount] = bind(
    from(liveQuery(() => db.errors.count())).pipe(map((count) => (count - 1 < 0 ? 0 : count - 1))),
    0,
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
    const isDirty = useIsDirty();

    return (
        <AppBar
            type={"footer"}
            className={"h-fit place-items-center border-base-light border-t bg-base-lightest text-sm"}
        >
            {/* Some general statistics about the project */}
            <div className={"flex flex-row divide-x divide-base-light"}>
                <p className={"px-4"}>{`Alternatives ${useAlternativeIDs().length}`}</p>
                <p className={"px-4"}>{`Costs ${useCostIDs().length}`}</p>
            </div>

            {/*
             * Displays whether the current project can be run by E3 or not.
             */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div className={"mx-2 flex cursor-pointer flex-row gap-2"} onClick={errorClick}>
                {/* The first error in the project */}
                <p className={"select-none"}>{!valid && `${error?.id}: ${error?.messages[0]}`}</p>

                {/* The total number of errors minus the first in the entire project */}
                {extraErrorCount > 0 && <p className={"select-none"}>Plus {extraErrorCount} more...</p>}

                {/* An icon denoting whether the project is valid or invalid */}
                <Tooltip title={valid ? "Project is valid" : "Project is invalid"} placement={"topRight"}>
                    <Icon
                        className={valid ? "text-success" : "text-error"}
                        path={valid ? mdiCheck : mdiWindowClose}
                        size={0.8}
                    />
                </Tooltip>

                {isDirty && (
                    <Tooltip title={"There are unsaved changes"} placement={"topRight"}>
                        <Icon className={"text-base"} path={mdiContentSaveAlert} size={0.8} />
                    </Tooltip>
                )}
            </div>
        </AppBar>
    );
}
