import AppBar from "./AppBar";
import Icon from "@mdi/react";
import { mdiCheck, mdiWindowClose } from "@mdi/js";
import { Model } from "../model/Model";
import { isProjectValid$ } from "../model/Project";
import { bind } from "@react-rxjs/core";

const [isValid] = bind(isProjectValid$, true);

/**
 * A bar that displays some overview statistics and status of the current project.
 */
export default function Statistics() {
    const valid = isValid();

    return (
        <AppBar className={"place-items-center border-t border-base-light bg-base-lightest text-sm"}>
            <div className={"flex flex-row divide-x divide-base-light"}>
                <p className={"px-4"}>{`Alternatives ${Model.useAlternatives().length}`}</p>
                <p className={"px-4"}>{`Costs ${Model.useCosts().length}`}</p>
            </div>

            {/*
             * Displays whether the current project can be run by E3 or not.
             * #TODO If not, display a tooltip with a link to where the error originates.
             */}
            <div>
                <Icon
                    className={"mx-2 " + (valid ? "text-success" : "text-error")}
                    path={valid ? mdiCheck : mdiWindowClose}
                    size={0.8}
                />
            </div>
        </AppBar>
    );
}
