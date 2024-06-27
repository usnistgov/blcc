import { CustomerSector, type EnergyCost, EnergyUnit, FuelType, type Unit } from "blcc-format/Format";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import {
    customerSector$,
    energyCost$,
    fuelType$,
    sFuelTypeChange$,
    sSectorChange$,
    sUnitChange$,
    unit$,
    useUnit,
} from "model/costs/EnergyCostModel";
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
        const costPerUnit$ = merge(sCostPerUnit$, energyCost$.pipe(map((cost) => cost.costPerUnit))).pipe(
            distinctUntilChanged(),
        );

        const sAnnualConsumption$ = new Subject<number>();
        const annualConsumption$ = merge(
            sAnnualConsumption$,
            energyCost$.pipe(map((cost) => cost.annualConsumption)),
        ).pipe(distinctUntilChanged());

        const sRebate$ = new Subject<number | undefined>();
        const rebate$ = merge(sRebate$, energyCost$.pipe(map((cost) => cost.rebate))).pipe(distinctUntilChanged());

        const sDemandCharge$ = new Subject<number | undefined>();
        const demandCharge = merge(sDemandCharge$, energyCost$.pipe(map((cost) => cost.demandCharge))).pipe(
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

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <Dropdown
                    className={"w-full"}
                    label={"Fuel Type"}
                    options={Object.values(FuelType)}
                    value$={fuelType$}
                    wire={sFuelTypeChange$}
                    showSearch
                />
                <Dropdown
                    className={"w-full"}
                    label={"Customer Sector"}
                    options={Object.values(CustomerSector)}
                    value$={customerSector$}
                    wire={sSectorChange$}
                    showSearch
                />

                <NumberInput
                    className={"w-full"}
                    addonAfter={
                        <Dropdown
                            className={"min-w-[75px]"}
                            placeholder={EnergyUnit.KWH}
                            options={Object.values(EnergyUnit) as Unit[]}
                            value$={unit$}
                            wire={sUnitChange$}
                        />
                    }
                    controls
                    rules={[min(0)]}
                    label={"Annual Consumption"}
                    wire={sAnnualConsumption$}
                    value$={annualConsumption$}
                />
                <NumberInput
                    className={"w-full"}
                    controls
                    addonAfter={`per ${useUnit()}`}
                    prefix={"$"}
                    label={"Cost per Unit"}
                    wire={sCostPerUnit$}
                    value$={costPerUnit$}
                />

                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    label={"Rebate"}
                    allowEmpty
                    wire={sRebate$}
                    value$={rebate$}
                />
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    label={"Demand Charge"}
                    allowEmpty
                    wire={sDemandCharge$}
                    value$={demandCharge$}
                />

                <EscalationRates title={"Escalation Rates"} />
                <UsageIndex title={"Usage Index"} />
            </div>
        </div>
    );
}
