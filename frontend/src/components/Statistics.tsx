import AppBar from "./AppBar";
import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import { Model } from "../model/Model";

export default function Statistics() {
    return (
        <AppBar className={"bg-base-lightest text-sm place-items-center"}>
            <div className={"flex flex-row divide-x divide-base-light border-t"}>
                <p className={"px-4"}>{`Alternatives ${Model.useAlternatives().length}`}</p>
                <p className={"px-4"}>{`Costs ${Model.useCosts().length}`}</p>
            </div>
            <div>
                <Icon className={"mx-2 text-success"} path={mdiCheck} size={0.8} />
            </div>
        </AppBar>
    );
}
