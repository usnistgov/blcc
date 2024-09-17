import { Divider } from "antd";
import { EmissionsRateType, GhgDataSource, SocialCostOfGhgScenario } from "blcc-format/Format";
import Info from "components/Info";
import { Dropdown } from "components/input/Dropdown";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";
import Nbsp from "util/Nbsp";

export default function GhgInput() {
    return (
        <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
            <Divider className={"col-span-3"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                <Info text={Strings.EMISSIONS_RATE_SCENARIO}>Greenhouse Gas (GHG) Emissions and Cost Assumptions</Info>
            </Divider>
            <Dropdown
                label={
                    <>
                        Data Source
                        <Nbsp />*
                    </>
                }
                className={"w-full"}
                options={Object.values(GhgDataSource)}
                wire={Model.sGhgDataSource$}
                value$={Model.ghgDataSource$}
            />
            <Dropdown
                label={
                    <>
                        Emissions Rate Type
                        <Nbsp />*
                    </>
                }
                className={"w-full"}
                options={Object.values(EmissionsRateType)}
                wire={Model.sEmissionsRateType$}
                value$={Model.emissionsRateType$}
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
