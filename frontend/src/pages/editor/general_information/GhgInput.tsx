import { Divider } from "antd";
import { EmissionsRateScenario, SocialCostOfGhgScenario } from "blcc-format/Format";
import Info from "components/Info";
import { Dropdown } from "components/input/Dropdown";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";
import Nbsp from "util/Nbsp";

export default function GhgInput() {
    return (
        <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                <Info text={Strings.EMISSIONS_RATE_SCENARIO}>Greenhouse Gas (GHG) Emissions and Cost Assumptions</Info>
            </Divider>
            <Dropdown
                label={
                    <>
                        Emissions Rate Scenario
                        <Nbsp />*
                    </>
                }
                className={"w-full"}
                info={Strings.GHG_ASSUMPTIONS}
                options={Object.values(EmissionsRateScenario)}
                wire={Model.sEmissionsRateScenario$}
                value$={Model.emissionsRateScenario$}
            />
            <Dropdown
                label={
                    <>
                        Social Cost of GHG Scenario
                        <Nbsp />*
                    </>
                }
                className={"w-full"}
                info={Strings.SOCIAL_COST_GHG}
                options={Object.values(SocialCostOfGhgScenario)}
                wire={Model.sSocialCostOfGhgScenario$}
                value$={Model.socialCostOfGhgScenario$}
            />
        </div>
    );
}
