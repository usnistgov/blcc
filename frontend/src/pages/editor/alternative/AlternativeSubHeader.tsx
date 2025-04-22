import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import { useStateObservable } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import SubHeader from "components/SubHeader";
import { Button, ButtonType } from "components/input/Button";
import AddAlternativeModal from "components/modal/AddAlternativeModal";
import { useSubscribe } from "hooks/UseSubscribe";
import { AlternativeModel } from "model/AlternativeModel";
import { db } from "model/db";
import { useMemo } from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { map } from "rxjs/operators";
import { Strings } from "constants/Strings";

/**
 * Curries a function to navigate to the last alternative in the list.
 * @param navigate The navigate function create a closure around.
 */
function gotoLastAlternative(navigate: NavigateFunction): () => Promise<void> {
    return async () => {
        // Navigate to last alternative after deletion of current one
        const lastAlternative = await db.alternatives.reverse().first();

        if (lastAlternative?.ERCIPBaseCase || lastAlternative === undefined) navigate("/editor/alternative/");
        else navigate(`/editor/alternative/${lastAlternative.id}`);
    };
}

export default function AlternativeSubHeader() {
    const [createAlt$, createAlt] = useMemo(() => createSignal(), []);

    const navigate = useNavigate();
    const name = useStateObservable(AlternativeModel.name$);

    // If the alternative was removed, navigate to the last alternative in the list
    useSubscribe(AlternativeModel.Actions.removeAlternative$, gotoLastAlternative(navigate));
    // If the alternative was cloned, navigate to the newly created clone
    useSubscribe(AlternativeModel.Actions.clonedAlternative$, (id) => navigate(`/editor/alternative/${id}`));

    return (
        <>
            <AddAlternativeModal open$={createAlt$.pipe(map(() => true))} />

            <SubHeader>
                <div className="flex justify-between">
                    <p className={"self-center px-6 text-ink"}>{name}</p>
                    <div className={"px-6"}>
                        <Button type={ButtonType.LINK} onClick={() => createAlt()} icon={mdiPlus}>
                            Add Alternative
                        </Button>
                        <Button
                            type={ButtonType.LINK}
                            onClick={() => AlternativeModel.Actions.cloneCurrent()}
                            tooltip={Strings.CLONE}
                            icon={mdiContentCopy}
                        >
                            Clone
                        </Button>
                        <Button
                            type={ButtonType.LINKERROR}
                            onClick={() => AlternativeModel.Actions.deleteCurrent()}
                            tooltip={Strings.DELETE}
                            icon={mdiMinus}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </SubHeader>
        </>
    );
}
