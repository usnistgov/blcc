import { bind } from "@react-rxjs/core";
import { Button, Checkbox, Col, Modal, Row, Typography } from "antd";
import React, { PropsWithChildren, useState } from "react";
import { map, withLatestFrom } from "rxjs/operators";
import button, { ButtonType } from "../components/Button";
import checkBoxComp from "../components/Checkbox";
import dropdown from "../components/Dropdown";
import textInput, { TextInputType } from "../components/TextInput";
import { useSubscribe } from "../hooks/UseSubscribe";

import { Model } from "../model/Model";
import { getNewID } from "../util/Util";
const { Title } = Typography;

export type ModalProps = {
    handleCancel?: MouseEventHandler<HTMLElement>;
    handleOk?: void;
    open?: boolean;
    setOpenAddAlternative?: any;
};

export type ModalComp = {
    component: React.FC<PropsWithChildren & ModalProps>;
};

const { click$: addCost$, component: AddCostBtn } = button();
const { onChange$: addCostChange$, component: NewCostInput } = textInput();
const { onChange$: onCheck$, component: CheckboxComp } = checkBoxComp();

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
export const check$ = addCost$.pipe(
    withLatestFrom(addCostChange$),
    withLatestFrom(addCostType$),
    withLatestFrom(checkedBox$),
    map((e) => {
        return e;
    })
);

const AddCostModal = () => {
    return {
        component: ({ open, handleCancel }: PropsWithChildren & ModalProps) => {
            // const [openAddAlternative, setOpenAddAlternative] = useState(open);
            const alts = Model.useAlternatives();
            const costs = Model.useCosts();
            const handleOk = () => {
                // useSubscribe(modifiedAddAlternative$, () => setOpenAddAlternative(false));
                // useModifiedAddAlternative();
                // setOpenAddAlternative(false);
                console.log(open);
            };

            const handleAltCancel = () => {
                setOpenAddAlternative(false);
            };
            console.log(open);

            return (
                <Modal
                    title="Add New Cost"
                    open={open}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            Return
                        </Button>,
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
