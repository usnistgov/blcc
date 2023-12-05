import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Checkbox, Col, Modal, Row, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { Observable, merge } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import button, { ButtonType } from "../components/Button";
import checkBoxComp from "../components/Checkbox";
import dropdown from "../components/Dropdown";
import textInput, { TextInputType } from "../components/TextInput";

import { Model } from "../model/Model";
const { Title } = Typography;

export type ModalComp = {
    component: React.FC<PropsWithChildren>;
};

const { click$: addCost$, component: AddCostBtn } = button();
const { onChange$: addCostChange$, component: NewCostInput } = textInput();
const { onChange$: onCheck$, component: CheckboxComp } = checkBoxComp();
const { click$: cancel$, component: CancelBtn } = button();

const costList = [
    "Capital Cost",
    "Energy Cost",
    "Water Cost",
    "Replacement Capital Cost",
    "OMR Cost",
    "Implementation Contract Cost",
    "Recurring Contract Cost",
    "Other Cost",
    "Other Non Monetary"
];

const { change$: addCostType$, component: CostCategoryDropdown } = dropdown(Object.values(costList));

const collectCheckedAlt = (a, checked: boolean, value: number) => {
    if (checked) a.add(value);
    else a.delete(value);
    return a;
};

const a = new Set([]);
export const checkedBox$ = onCheck$.pipe(
    map((e) => {
        const target = e.target;
        collectCheckedAlt(a, target.checked, target.value);
        return a;
    })
);
export const modifiedAddCost$ = addCost$.pipe(
    withLatestFrom(addCostChange$),
    withLatestFrom(addCostType$),
    withLatestFrom(checkedBox$),
    map((e) => {
        return e;
    })
);

const AddCostModal = (modifiedOpenModal$: Observable<boolean>) => {
    const [modalCancel$, cancel] = createSignal();
    const [useOpen] = bind(
        merge(
            modifiedOpenModal$,
            cancel$.pipe(map(() => false)),
            modifiedAddCost$.pipe(map(() => false)),
            modalCancel$.pipe(map(() => false))
        ),
        false
    );
    return {
        component: () => {
            const openModal = useOpen();
            const alts = Model.useAlternatives();

            return (
                <Modal
                    title="Add New Cost"
                    open={openModal}
                    onCancel={cancel}
                    footer={[
                        <CancelBtn type={ButtonType.ERROR} key="back">
                            Return
                        </CancelBtn>,
                        <AddCostBtn type={ButtonType.PRIMARY} key="add-cost-btn">
                            Add
                        </AddCostBtn>
                    ]}
                >
                    <div>
                        <Title level={5}>Name</Title>
                        <NewCostInput type={TextInputType.PRIMARY} />
                    </div>
                    <br />
                    <div className="w-full">
                        <Title level={5}>Add to Alternatives</Title>
                        <Checkbox.Group style={{ width: "100%" }}>
                            <Row>
                                {alts.length
                                    ? alts.map((option) => (
                                          <Col span={16}>
                                              <CheckboxComp value={option?.id} key={option?.id}>
                                                  {option?.name}
                                              </CheckboxComp>
                                          </Col>
                                      ))
                                    : "No Alternatives"}
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
};

export default AddCostModal;
