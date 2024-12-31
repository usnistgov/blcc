import { Divider } from "antd";
import { EmissionsRateType, GhgDataSource, SocialCostOfGhgScenario } from "blcc-format/Format";
import Info from "components/Info";
import { Dropdown } from "components/input/Dropdown";
import { TestSelect } from "components/input/TestSelect";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";
import Nbsp from "util/Nbsp";

export default function GhgInput() {
    return (
        <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
            <Divider className={"col-span-3"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                <Info text={Strings.EMISSIONS_RATE_SCENARIO}>Greenhouse Gas (GHG) Emissions and Cost Assumptions</Info>
            </Divider>
            <TestSelect
                label={"Data Source"}
                required
                className={"w-full"}
                options={Object.values(GhgDataSource)}
                getter={Model.ghgDataSource.use}
                onChange={(change) => Model.ghgDataSource.set(change)}
            />
            <TestSelect
                label={"Emissions Rate Type"}
                required
                className={"w-full"}
                options={Object.values(EmissionsRateType)}
                getter={Model.emissionsRateType.use}
                onChange={(change) => Model.emissionsRateType.set(change)}
            />
            <TestSelect
                label={"Social Cost of GHG Scenario"}
                required
                className={"w-full"}
                info={Strings.SOCIAL_COST_GHG}
                options={Object.values(SocialCostOfGhgScenario)}
                getter={Model.socialCostOfGhgScenario.use}
                onChange={(change) => Model.socialCostOfGhgScenario.set(change)}
            />
        </div>
    );
}
