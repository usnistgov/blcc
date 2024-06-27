import { mdiClose, mdiPlus } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal, Typography } from "antd";
import { type Cost, CostTypes, type ID } from "blcc-format/Format";
import { Button, ButtonType } from "components/input/Button";
import { Dropdown } from "components/input/Dropdown";
import TextInput, { TextInputType } from "components/input/TextInput";
import AppliedCheckboxes from "components/navigation/AppliedCheckboxes";
import { useSubscribe } from "hooks/UseSubscribe";
import { AlternativeModel } from "model/AlternativeModel";
import { currentProject$ } from "model/Model";
import { db } from "model/db";
import { useMemo } from "react";
import { BehaviorSubject, type Observable, Subject, combineLatest, merge, sample } from "rxjs";
import { map } from "rxjs/operators";
import { guard } from "util/Operators";

type AddCostModalProps = {
    open$: Observable<boolean>;
};

function createCostInDB([projectID, name, type, alts]: [number, string, CostTypes, Set<number>]): Promise<void> {
    return db.transaction("rw", db.costs, db.projects, db.alternatives, async () => {
        // Add new cost to DB and get new ID
        const newID = await db.costs.add({ name, type } as Cost);

        // Add new cost ID to project
        await db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                project.costs.push(newID);
            });

        // Add new cost ID to alternatives
        await db.alternatives
            .where("id")
            .anyOf([...alts.values()])
            .modify((alt) => {
                alt.costs.push(newID);
            });
    });
}

export default function AddCostModal({ open$ }: AddCostModalProps) {
    const [useOpen, cancel, disableAdd, sCheckAlt$, sName$, sType$, sAddClick$, sCancelClick$, newCost$, isOpen$] =
        useMemo(() => {
            const sName$ = new BehaviorSubject<string | undefined>(undefined);
            const sAddClick$ = new Subject<void>();
            const sCancelClick$ = new Subject<void>();
            const sType$ = new BehaviorSubject<CostTypes>(CostTypes.ENERGY);
            const sCheckAlt$ = new Subject<Set<ID>>();

            const newCost$ = combineLatest([currentProject$, sName$.pipe(guard()), sType$, sCheckAlt$]).pipe(
                sample(sAddClick$),
            );

            const [modalCancel$, cancel] = createSignal();
            const [useOpen, isOpen$] = bind(
                merge(open$, merge(sCancelClick$, newCost$, modalCancel$).pipe(map(() => false))),
                false,
            );

            const [disableAdd] = bind(sName$.pipe(map((name) => name === "" || name === undefined)), true);

            return [
                useOpen,
                cancel,
                disableAdd,
                sCheckAlt$,
                sName$,
                sType$,
                sAddClick$,
                sCancelClick$,
                newCost$,
                isOpen$,
            ];
        }, [open$]);

    //Clear fields when modal closes
    useSubscribe(isOpen$, () => {
        sName$.next(undefined);
        sType$.next(CostTypes.ENERGY);
    });
    // Create the new costs in the database
    useSubscribe(newCost$, createCostInDB);

    return (
        <Modal
            title="Add New Cost"
            open={useOpen()}
            onCancel={cancel}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.ERROR} icon={mdiClose} wire={sCancelClick$}>
                        Cancel
                    </Button>
                    <Button type={ButtonType.PRIMARY} icon={mdiPlus} disabled={disableAdd()} wire={sAddClick$}>
                        Add
                    </Button>
                </div>
            }
        >
            <div>
                <Typography.Title level={5}>Name</Typography.Title>
                <TextInput type={TextInputType.PRIMARY} wire={sName$} />
            </div>
            <br />
            <div className="w-full">
                <Typography.Title level={5}>Add to Alternatives</Typography.Title>
                <AppliedCheckboxes defaults={[AlternativeModel.useID()]} wire={sCheckAlt$} />
                {/*<Checkbox.Group
                    style={{ width: "100%" }}
                    value={useChecked()}
                    onChange={(values) => setCheckedAlts(values as number[])}
                >
                    <Row>
                        {useAlternatives().map((alt) => (
                            <Col span={16} key={alt.id}>
                                <Checkbox value={alt.id}>{alt.name}</Checkbox>
                            </Col>
                        )) || "No Alternatives"}
                    </Row>
                </Checkbox.Group>*/}
            </div>
            <br />
            <div>
                <Typography.Title level={5}>Cost Category</Typography.Title>
                <Dropdown options={Object.values(CostTypes)} wire={sType$} />
            </div>
        </Modal>
    );
}
