import { Divider, Switch } from "antd";
import { DollarOrPercent } from "blcc-format/Format";
import { TestNumberInput } from "components/input/TestNumberInput";
import { TestSelect } from "components/input/TestSelect";
import { Strings } from "constants/Strings";
import { ResidualValueModel } from "model/ResidualValueModel";

/**
 * Component to display the inputs associated with residual value
 */
export default function ResidualValue() {
    const hasResidualValue = ResidualValueModel.hasResidualValue();

    return (
        <div className={"flex flex-col"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Residual Value
            </Divider>
            <div>
                <Switch
                    checkedChildren={"Yes"}
                    unCheckedChildren={"No"}
                    value={hasResidualValue}
                    onChange={ResidualValueModel.Actions.toggle}
                />
            </div>
            {hasResidualValue && <ResidualValueInput />}
        </div>
    );
}

function ApproachSelect() {
    const approach = ResidualValueModel.approach.use();
    const value = ResidualValueModel.value.use();

    return (
        <TestSelect
            label={"Approach"}
            showLabel={false}
            options={Object.values(DollarOrPercent)}
            getter={ResidualValueModel.approach.use}
            onChange={(option) => ResidualValueModel.Actions.setApproach(approach, option, value)}
        />
    );
}

function ResidualValueInput() {
    const approach = ResidualValueModel.approach.use();

    return (
        <div className={"grid grid-cols-3 gap-x-16 gap-y-4 pt-6"}>
            <TestNumberInput
                className={"w-full"}
                info={Strings.RESIDUAL_VALUE}
                id={"residual-value"}
                addonBefore={approach === DollarOrPercent.DOLLAR ? <ApproachSelect /> : undefined}
                addonAfter={approach === DollarOrPercent.PERCENT ? <ApproachSelect /> : undefined}
                label={"Value"}
                getter={
                    approach === DollarOrPercent.PERCENT
                        ? ResidualValueModel.useValuePercent
                        : ResidualValueModel.value.use
                }
                onChange={(change) => ResidualValueModel.Actions.setValue(change, approach)}
            />
        </div>
    );
}
