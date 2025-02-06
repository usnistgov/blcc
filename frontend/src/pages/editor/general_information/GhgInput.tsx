import { Divider } from "antd";
import { EmissionsRateType, GhgDataSource, SocialCostOfGhgScenario } from "blcc-format/Format";
import Info from "components/Info";
import { TestSelect } from "components/input/TestSelect";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";

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
                onChange={(change) => {
                    // If we set to NIST_NETL, make sure emissions rate type is Average since we do not have LRM data
                    // for that data source
                    if (change === GhgDataSource.NIST_NETL) Model.emissionsRateType.set(EmissionsRateType.AVERAGE);

                    Model.ghgDataSource.set(change);
                }}
            />
            <TestSelect
                label={"Emissions Rate Type"}
                required
                className={"w-full"}
                optionGetter={Model.useEmissionsRateOptions}
                getter={Model.emissionsRateType.use}
                onChange={(change) => Model.emissionsRateType.set(change)}
            />
        </div>
    );
}
