import { mdiCheck, mdiContentSaveAlert, mdiWindowClose } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Tooltip } from "antd";
import AppBar from "components/AppBar";
import { useSubscribe } from "hooks/UseSubscribe";
import { useAllAlternatives, useAllCosts, useIsDirty } from "model/Model";
import { firstError$, isValid, useErrors, useFirstError } from "model/Validation";
import type { PropsWithChildren, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { sample } from "rxjs";
import { guard } from "util/Operators";

// Signal for when an error message is click to navigate to error location
const [errorClick$, errorClick] = createSignal();

const [errorHover$, onErrorHover] = createSignal<boolean>();
const [useErrorHover] = bind(errorHover$, false);

export function ErrorElements() {
    const navigate = useNavigate();
    const allErrors = useErrors();
    const valid = isValid();

    const errorElements = [];
    for (const error of allErrors) {
        if (error.context !== undefined && error.messages.length > 0) {
            errorElements.push(
                <div className="flex flex-row">
                    <p className="font-bold text-base-darker pr-8">{error.context}</p>
                </div>,
            );
        }
        const messageElements = error.messages.map((message) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
                key={`${JSON.stringify(error)}${message}`}
                onClick={() => navigate(error.url)}
                className="flex flex-row gap-x-4"
            >
                <p className="flex-[7] text-ink hover:text-base-dark pb-1">{message}</p>
                <Icon
                    className={`${valid ? "text-success" : "text-error "} flex-1 -mr-3`}
                    path={mdiWindowClose}
                    size={0.8}
                />
            </div>
        ));
        errorElements.push(messageElements);
    }
    return errorElements;
}

function ErrorMenu({ children }: PropsWithChildren) {
    // Navigates to page with the currently displaying error
    const errorHover = useErrorHover();

    return (
        <div
            className={"mx-2 flex cursor-pointer flex-row gap-2 relative"}
            onMouseEnter={() => onErrorHover(true)}
            onMouseLeave={() => onErrorHover(false)}
        >
            {/* The first error in the project */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
                className={`absolute bottom-5 right-6 w-max rounded-md border border-base-light bg-off-white shadow-md p-5 ${errorHover ? "" : "hidden"}`}
            >
                <ErrorElements />
            </div>
            {children}
        </div>
    );
}

/**
 * A bar that displays some overview statistics and status of the current project.
 */
export default function Statistics() {
    // Navigates to page with the currently displaying error
    const navigate = useNavigate();
    useSubscribe(firstError$.pipe(sample(errorClick$), guard()), (error) => navigate(error.url), [navigate]);

    // Use hooks
    const valid = isValid();
    const firstError = useFirstError();
    const isDirty = useIsDirty();
    const alternativesQuantity = useAllAlternatives().length;
    const costs = useAllCosts();
    const costsQuantity = costs.length;
    const allErrors = useErrors();

    return (
        <AppBar
            type={"footer"}
            className={"h-fit place-items-center border-base-light border-t bg-base-lightest text-sm"}
        >
            {/* Some general statistics about the project */}
            <div className={"flex flex-row divide-x divide-base-light"}>
                <p className={"px-4"}>{`Alternatives ${alternativesQuantity}`}</p>
                <p className={"px-4"}>{`Costs ${costsQuantity}`}</p>
            </div>

            {/*
             * Displays whether the current project can be run by E3 or not.
             */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <ErrorMenu>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <p className={"select-none"} onClick={errorClick}>
                    {!valid && `${firstError?.messages[0]}`}
                </p>

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
            </ErrorMenu>
        </AppBar>
    );
}
