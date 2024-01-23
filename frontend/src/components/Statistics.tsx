import AppBar from "./AppBar";
import Icon from "@mdi/react";
import { mdiCheck, mdiWindowClose } from "@mdi/js";
import { Model } from "../model/Model";
import { isProjectValid$ } from "../model/Project";
import { bind } from "@react-rxjs/core";

const [isValid] = bind(isProjectValid$, true);

export default function Statistics() {
    const valid = isValid();

    return (
        <AppBar className={"place-items-center border-t border-base-light bg-base-lightest text-sm"}>
            <div className={"flex flex-row divide-x divide-base-light"}>
                <p className={"px-4"}>{`Alternatives ${Model.useAlternatives().length}`}</p>
                <p className={"px-4"}>{`Costs ${Model.useCosts().length}`}</p>
            </div>
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
