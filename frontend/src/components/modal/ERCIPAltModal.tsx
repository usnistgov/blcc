import { mdiClose } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal } from "antd";
import { Button, ButtonType } from "components/input/Button";
import { useSubscribe } from "hooks/UseSubscribe";
import { db } from "model/db";
import { currentProject$, useAlternatives } from "model/Model";
import { map, merge, withLatestFrom } from "rxjs";

function removeERCIPOtherAlts([altToSkipID, projectID]: [number, number]) {
    return db.transaction("rw", db.alternatives, db.projects, db.costs, async () => {
        for (const alt of await db.alternatives.toArray()) {
            const alternativeID = alt.id;

            // Skip if this is the alternative to keep
            if (alternativeID === altToSkipID || alternativeID === undefined || alt.ERCIPBaseCase) {
                continue;
            }

            // Remove costs only associated with this alternative
            for (const costID of (await db.alternatives.where("id").equals(alternativeID).toArray()).flatMap(
                (alt) => alt.costs,
            )) {
                // Delete if it belongs to only one alternative
                if ((await db.alternatives.toArray()).filter((alt) => alt.costs.includes(costID)).length <= 1) {
                    db.costs.where("id").equals(costID).delete();
                }
            }

            // Remove alternative
            db.alternatives.where("id").equals(alternativeID).delete();

            // Remove alternative ID from project
            db.projects
                .where("id")
                .equals(projectID)
                .modify((project) => {
                    const index = project.alternatives.indexOf(alternativeID);
                    if (index > -1) {
                        project.alternatives.splice(index, 1);
                    }
                });
        }
    });
}

export namespace ERCIPAltModel {
    export const [close$, close] = createSignal();
    export const [open$, open] = createSignal();
    export const [useOpen] = bind(merge(close$.pipe(map(() => false)), open$.pipe(map(() => true))), false);
    export const [deleteERCIPAlts$, deleteERCIPAlts] = createSignal<number>();
}

export default function ERCIPALtModal() {
    const alts = useAlternatives();

    useSubscribe(ERCIPAltModel.deleteERCIPAlts$.pipe(withLatestFrom(currentProject$)), ([altToSkip, projectId]) => {
        removeERCIPOtherAlts([altToSkip, projectId]);
        ERCIPAltModel.close();
    });

    return (
        <Modal
            title={"ERCIP requires one alternative and one base case. Which alternative would you like to keep?"}
            closable={false}
            onCancel={ERCIPAltModel.close}
            open={ERCIPAltModel.useOpen()}
        >
            <div className={"mt-8 px-10 flex flex-col gap-4"}>
                {alts
                    .filter((alt) => !alt.ERCIPBaseCase)
                    .map((alt) => (
                        <Button
                            key={alt.name + alt.id}
                            onClick={() => {
                                if (alt.id !== undefined) {
                                    ERCIPAltModel.deleteERCIPAlts(alt.id);
                                }
                            }}
                        >
                            {alt.name}
                        </Button>
                    ))}
            </div>
        </Modal>
    );
}
