import { Divider } from "antd";
import Switch from "components/input/Switch";
import { ResidualValueModel } from "model/ResidualValueModel";

export default function ResidualValue() {
    return (
        <div className={"col-span-2"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Residual Value
            </Divider>
            <Switch wire={ResidualValueModel.sSetResidualValue$} value$={ResidualValueModel.hasResidualValue$} />
        </div>
    );
}
