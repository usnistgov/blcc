import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import { DollarOrPercent } from "blcc-format/Format";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { Strings } from "constants/Strings";
import { ResidualValueModel } from "model/ResidualValueModel";
import { useMemo } from "react";

/**
 * Component to display the inputs associated with residual value
 */
export default function ResidualValue() {
    const approach = useStateObservable(ResidualValueModel.approach$);
    const hasResidualValue = useStateObservable(ResidualValueModel.hasResidualValue$);

    const approachDropdown = useMemo(
        () => (
            <Dropdown
                label={"Approach"}
                showLabel={false}
                options={Object.values(DollarOrPercent)}
                wire={ResidualValueModel.sApproach$}
                value$={ResidualValueModel.approach$}
            />
        ),
        [],
    );

    return (
        <div className={"flex flex-col"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Residual Value
            </Divider>
            <div>
                <Switch
                    unCheckedChildren={"None"}
                    wire={ResidualValueModel.sSetResidualValue$}
                    value$={ResidualValueModel.hasResidualValue$}
                />
            </div>
            {hasResidualValue && (
                <div className={"grid grid-cols-3 gap-x-16 gap-y-4 pt-6"}>
                    <NumberInput
                        className={"w-full"}
                        info={Strings.RESIDUAL_VALUE}
                        id={"residual-value"}
                        addonBefore={
                            approach === DollarOrPercent.DOLLAR ? approachDropdown : undefined
                        }
                        addonAfter={
                            approach === DollarOrPercent.PERCENT ? approachDropdown : undefined
                        }
                        label={"Value"}
                        allowEmpty
                        value$={ResidualValueModel.value$}
                        wire={ResidualValueModel.sValue$}
                    />
                </div>
            )}
        </div>
    );
}
