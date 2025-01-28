import { useStateObservable } from "@react-rxjs/core";
import { Divider, Switch } from "antd";
import { EnergyUnit, FuelType, type Unit } from "blcc-format/Format";
import Info from "components/Info";
import Location from "components/Location";
import { Dropdown } from "components/input/Dropdown";
import { TestNumberInput } from "components/input/TestNumberInput";
import { TestSelect } from "components/input/TestSelect";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import EscalationRates from "pages/editor/cost/energycostfields/EscalationRates";
import UsageIndex from "pages/editor/cost/energycostfields/UsageIndex";

export default function EnergyCostFields() {
    const isSavings = CostModel.costOrSavings.use();

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TestSelect
                    className={"w-full"}
                    label={"Fuel Type"}
                    info={Strings.FUEL_TYPE}
                    options={Object.values(FuelType)}
                    getter={EnergyCostModel.fuelType.use}
                    onChange={EnergyCostModel.Actions.setFueltype}
                    showSearch
                />
                <TestSelect
                    className={"w-full"}
                    label={"Customer Sector"}
                    info={Strings.CUSTOMER_SECTOR}
                    optionGetter={EnergyCostModel.sectorOptions}
                    getter={EnergyCostModel.customerSector.use}
                    onChange={EnergyCostModel.Actions.setCustomerSector}
                    showSearch
                />

                <TestNumberInput
                    className={"w-full"}
                    info={Strings.ANNUAL_CONSUMPTION}
                    addonAfter={
                        <Dropdown
                            className={"min-w-[75px]"}
                            placeholder={EnergyUnit.KWH}
                            options={Object.values(EnergyUnit) as Unit[]}
                            value$={EnergyCostModel.unit$}
                            wire={EnergyCostModel.sUnitChange$}
                        />
                    }
                    controls
                    label={isSavings ? "Annual Consumption Savings" : "Annual Consumption"}
                    getter={EnergyCostModel.annualConsumption.use}
                    onChange={EnergyCostModel.Actions.setAnnualConsumption}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.COST_PER_UNIT}
                    controls
                    addonAfter={`per ${EnergyCostModel.useUnit()}`}
                    prefix={"$"}
                    label={isSavings ? "Cost Savings per Unit" : "Cost per Unit"}
                    getter={EnergyCostModel.costPerUnit.use}
                    onChange={EnergyCostModel.Actions.setCostPerUnit}
                />

                <TestNumberInput
                    className={"w-full"}
                    info={Strings.REBATE}
                    addonBefore={"$"}
                    label={"Rebate"}
                    getter={EnergyCostModel.rebate.use}
                    onChange={EnergyCostModel.Actions.setRebate}
                />
                <TestNumberInput
                    className={"w-full"}
                    info={Strings.DEMAND_CHARGE}
                    addonBefore={"$"}
                    label={"Demand Charge"}
                    getter={EnergyCostModel.demandCharge.use}
                    onChange={EnergyCostModel.Actions.setDemandCharge}
                />

                <EnergyCostLocation />

                <EscalationRates title={<Info text={Strings.ESCALATION_RATES}>Escalation Rates</Info>} />
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}

function EnergyCostLocation() {
    const customLocation = EnergyCostModel.Location.isUsingCustomLocation();

    return (
        <div className={"col-span-2"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Location
            </Divider>
            <Switch
                className={"mb-4"}
                unCheckedChildren={"Project Location"}
                checkedChildren={"Custom Location"}
                onChange={EnergyCostModel.Location.Actions.toggleLocation}
                checked={customLocation}
            />
            {customLocation && (
                <div className={"grid grid-cols-2 gap-x-16 gap-y-4 pb-4"}>
                    <Location model={EnergyCostModel.Location.model} />
                </div>
            )}
            <Divider className={"col-span-2 my-2"} />
        </div>
    );
}
