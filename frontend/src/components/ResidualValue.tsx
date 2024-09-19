import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import { DollarOrPercent } from "blcc-format/Format";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { Strings } from "constants/Strings";
import { ResidualValueModel } from "model/ResidualValueModel";

export default function ResidualValue() {
    const approach = ResidualValueModel.useApproach();
    const hasResidualValue = useStateObservable(ResidualValueModel.hasResidualValue$);

    return (
        <div className={"col-span-3"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Residual Value
            </Divider>
            <Switch
                unCheckedChildren={"None"}
                wire={ResidualValueModel.sSetResidualValue$}
                value$={ResidualValueModel.hasResidualValue$}
            />
            {hasResidualValue && (
                <NumberInput
                    className={"py-4"}
                    info={Strings.RESIDUAL_VALUE}
                    addonBefore={approach === DollarOrPercent.DOLLAR ? "$" : undefined}
                    addonAfter={approach === DollarOrPercent.PERCENT ? "%" : undefined}
                    label={"Residual Value"}
                    showLabel={false}
                    allowEmpty
                    value$={ResidualValueModel.value$}
                    wire={ResidualValueModel.sValue$}
                />
            )}
        </div>
    );
}
