import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import { CustomerSector, type EnergyCost, EnergyUnit, FuelType, type Unit } from "blcc-format/Format";
import Info from "components/Info";
import Location from "components/Location";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { Strings } from "constants/Strings";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import { min } from "model/rules/Rules";
import EscalationRates from "pages/editor/cost/energycostfields/EscalationRates";
import UsageIndex from "pages/editor/cost/energycostfields/UsageIndex";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, map, merge } from "rxjs";

export default function EnergyCostFields() {
    const [
        sCostPerUnit$,
        costPerUnit$,
        sAnnualConsumption$,
        annualConsumption$,
        sRebate$,
        rebate$,
        sDemandCharge$,
        demandCharge$,
        collection$,
    ] = useMemo(() => {
        // If we are on this page that means the cost collection can be narrowed to EnergyCost.
        const collection$ = CostModel.collection$ as Observable<Collection<EnergyCost, number>>;

        const sCostPerUnit$ = new Subject<number>();
        const costPerUnit$ = merge(sCostPerUnit$, EnergyCostModel.cost$.pipe(map((cost) => cost.costPerUnit))).pipe(
            distinctUntilChanged(),
        );

        const sAnnualConsumption$ = new Subject<number>();
        const annualConsumption$ = merge(
            sAnnualConsumption$,
            EnergyCostModel.cost$.pipe(map((cost) => cost.annualConsumption)),
        ).pipe(distinctUntilChanged());

        const sRebate$ = new Subject<number | undefined>();
        const rebate$ = merge(sRebate$, EnergyCostModel.cost$.pipe(map((cost) => cost.rebate))).pipe(
            distinctUntilChanged(),
        );

        const sDemandCharge$ = new Subject<number | undefined>();
        const demandCharge = merge(sDemandCharge$, EnergyCostModel.cost$.pipe(map((cost) => cost.demandCharge))).pipe(
            distinctUntilChanged(),
        );

        return [
            sCostPerUnit$,
            costPerUnit$,
            sAnnualConsumption$,
            annualConsumption$,
            sRebate$,
            rebate$,
            sDemandCharge$,
            demandCharge,
            collection$,
        ];
    }, []);

    useDbUpdate(sCostPerUnit$, collection$, "costPerUnit");
    useDbUpdate(sAnnualConsumption$, collection$, "annualConsumption");
    useDbUpdate(sRebate$, collection$, "rebate");
    useDbUpdate(sDemandCharge$, collection$, "demandCharge");

    //TODO add other fields

    const isSavings = useStateObservable(CostModel.costSavings$);
    const customLocation = useStateObservable(EnergyCostModel.Location.customLocation$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <Dropdown
                    className={"w-full"}
                    label={"Fuel Type"}
                    info={Strings.FUEL_TYPE}
                    options={Object.values(FuelType)}
                    value$={EnergyCostModel.fuelType$}
                    wire={EnergyCostModel.sFuelTypeChange$}
                    showSearch
                />
                <Dropdown
                    className={"w-full"}
                    label={"Customer Sector"}
                    info={Strings.CUSTOMER_SECTOR}
                    options={EnergyCostModel.sectorOptions$}
                    value$={EnergyCostModel.customerSector$}
                    wire={EnergyCostModel.sSectorChange$}
                    showSearch
                />

                <NumberInput
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
                    rules={[min(0)]}
                    label={isSavings ? "Annual Consumption Savings" : "Annual Consumption"}
                    wire={sAnnualConsumption$}
                    value$={annualConsumption$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.COST_PER_UNIT}
                    controls
                    addonAfter={`per ${EnergyCostModel.useUnit()}`}
                    prefix={"$"}
                    label={isSavings ? "Cost Savings per Unit" : "Cost per Unit"}
                    wire={sCostPerUnit$}
                    value$={costPerUnit$}
                />

                <NumberInput
                    className={"w-full"}
                    info={Strings.REBATE}
                    addonBefore={"$"}
                    label={"Rebate"}
                    allowEmpty
                    wire={sRebate$}
                    value$={rebate$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.DEMAND_CHARGE}
                    addonBefore={"$"}
                    label={"Demand Charge"}
                    allowEmpty
                    wire={sDemandCharge$}
                    value$={demandCharge$}
                />

                <div className={"col-span-2"}>
                    <Divider
                        className={"col-span-2"}
                        style={{ fontSize: "20px" }}
                        orientation={"left"}
                        orientationMargin={"0"}
                    >
                        Location
                    </Divider>
                    <Switch
                        className={"mb-4"}
                        unCheckedChildren={"Project Location"}
                        checkedChildren={"Custom Location"}
                        wire={EnergyCostModel.Location.sToggleLocation$}
                        value$={EnergyCostModel.Location.customLocation$}
                    />
                    {customLocation && (
                        <div className={"grid grid-cols-2 gap-x-16 gap-y-4 pb-4"}>
                            <Location model={EnergyCostModel.Location.model} />
                        </div>
                    )}
                    <Divider className={"col-span-2 my-2"} />
                </div>

                <EscalationRates
                    title={<Info text={Strings.ESCALATION_RATES}>Escalation Rates</Info>}
                    defaultRates$={EnergyCostModel.fetchEscalationRates$}
                />
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}
