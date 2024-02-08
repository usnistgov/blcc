import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Checkbox, Col, Modal, Row, Typography } from "antd";
import React from "react";
import { combineLatest, merge, Observable, sample } from "rxjs";
import { map } from "rxjs/operators";
import button, { ButtonType } from "../components/Button";
import dropdown from "../components/Dropdown";
import textInput, { TextInputType } from "../components/TextInput";

import { Cost, CostTypes } from "../blcc-format/Format";
import { mdiClose, mdiPlus } from "@mdi/js";
import { currentProject$, useAlternatives } from "../model/Model";
import { useSubscribe } from "../hooks/UseSubscribe";
import { db } from "../model/db";

const { Title } = Typography;
const { click$: addCost$, component: AddButton } = button();
const { onChange$: name$, component: NewCostInput } = textInput();
const { click$: cancel$, component: CancelButton } = button();
const { change$: type$, component: CostCategoryDropdown } = dropdown(Object.values(CostTypes));

const [checkedAlts$, setCheckedAlts] = createSignal<number[]>();

const newCost$ = combineLatest([currentProject$, name$, type$, checkedAlts$]).pipe(sample(addCost$));

//TODO make inputs clear when closing the modal

export default function addCostModal(modifiedOpenModal$: Observable<boolean>) {
    const [modalCancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            modifiedOpenModal$,
            cancel$.pipe(map(() => false)),
            newCost$.pipe(map(() => false)),
            modalCancel$.pipe(map(() => false))
        ),
        false
    );
    return {
        component: () => {
            const openModal = useOpen();

            useSubscribe(newCost$, async ([projectID, name, type, alts]) => {
                db.transaction("rw", db.costs, db.projects, db.alternatives, async () => {
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
                        .anyOf(alts)
                        .modify((alt) => {
                            alt.costs.push(newID);
                        });
                });
            });

            return (
                <Modal
                    title="Add New Cost"
                    open={openModal}
                    onCancel={cancel}
                    footer={
                        <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                            <CancelButton type={ButtonType.ERROR} icon={mdiClose}>
                                Cancel
                            </CancelButton>
                            <AddButton type={ButtonType.PRIMARY} icon={mdiPlus}>
                                Add
                            </AddButton>
                        </div>
                    }
                >
                    <div>
                        <Title level={5}>Name</Title>
                        <NewCostInput type={TextInputType.PRIMARY} />
                    </div>
                    <br />
                    <div className="w-full">
                        <Title level={5}>Add to Alternatives</Title>
                        <Checkbox.Group
                            style={{ width: "100%" }}
                            onChange={(values) => setCheckedAlts(values as number[])}
                        >
                            <Row>
                                {useAlternatives().map((alt) => (
                                    <Col span={16} key={alt.id}>
                                        <Checkbox value={alt.id}>{alt.name}</Checkbox>
                                    </Col>
                                )) || "No Alternatives"}
                            </Row>
                        </Checkbox.Group>
                    </div>
                    <br />
                    <div>
                        <Title level={5}>Cost Category</Title>
                        <CostCategoryDropdown className="w-full" />
                    </div>
                </Modal>
            );
        }
    };
}
