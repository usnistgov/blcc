import { useStateObservable } from "@react-rxjs/core";
import { type CapitalCost, CostTypes } from "blcc-format/Format";
import ResidualValue from "components/ResidualValue";
import { NumberInput } from "components/input/InputNumber";
import { Strings } from "constants/Strings";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import React, { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, filter, merge } from "rxjs";
import { map } from "rxjs/operators";

export default function InvestmentCapitalCostFields() {
    const [
        sInitialCost$,
        initialCost$,
        sAnnualRateOfChange$,
        annualRateOfChange$,
        sExpectedLifetime$,
        expectedLifetime$,
        sCostAdjustmentFactor$,
        costAdjustmentFactor$,
        sAmountFinanced$,
        amountFinanced$,
        collection$,
    ] = useMemo(() => {
        // If we are on this page that means the cost collection can be narrowed to CapitalCost.
        const collection$ = CostModel.collection$ as Observable<Collection<CapitalCost, number>>;
        const capitalCost$ = CostModel.cost$.pipe(
            filter((cost): cost is CapitalCost => cost.type === CostTypes.CAPITAL),
        );

        const sInitialCost$ = new Subject<number | undefined>();
        const initialCost$ = merge(sInitialCost$, capitalCost$.pipe(map((cost) => cost.initialCost))).pipe(
            distinctUntilChanged(),
        );

        const sAnnualRateOfChange$ = new Subject<number | undefined>();
        const annualRateOfChange$ = merge(
            sAnnualRateOfChange$,
            capitalCost$.pipe(map((cost) => cost.annualRateOfChange)),
        ).pipe(distinctUntilChanged());

        const sExpectedLifetime$ = new Subject<number | undefined>();
        const expectedLifetime$ = merge(sExpectedLifetime$, capitalCost$.pipe(map((cost) => cost.expectedLife))).pipe(
            distinctUntilChanged(),
        );

        const sCostAdjustmentFactor$ = new Subject<number | undefined>();
        const costAdjustmentFactor$ = merge(
            sCostAdjustmentFactor$,
            capitalCost$.pipe(map((cost) => cost.costAdjustment)),
        ).pipe(distinctUntilChanged());

        const sAmountFinanced$ = new Subject<number | undefined>();
        const amountFinanced$ = merge(sAmountFinanced$, capitalCost$.pipe(map((cost) => cost.amountFinanced))).pipe(
            distinctUntilChanged(),
        );

        return [
            sInitialCost$,
            initialCost$,
            sAnnualRateOfChange$,
            annualRateOfChange$,
            sExpectedLifetime$,
            expectedLifetime$,
            sCostAdjustmentFactor$,
            costAdjustmentFactor$,
            sAmountFinanced$,
            amountFinanced$,
            collection$,
        ];
    }, []);

    useDbUpdate(sInitialCost$, collection$, "initialCost");
    useDbUpdate(sAnnualRateOfChange$, collection$, "annualRateOfChange");
    useDbUpdate(sExpectedLifetime$, collection$, "expectedLife");
    useDbUpdate(sCostAdjustmentFactor$, collection$, "costAdjustment");
    useDbUpdate(sAmountFinanced$, collection$, "amountFinanced");

    const isSavings = useStateObservable(CostModel.costSavings$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    info={Strings.INITIAL_COST}
                    addonBefore={"$"}
                    controls
                    allowEmpty
                    label={isSavings ? "Initial Cost Savings (Base Year Dollars)" : "Initial Cost (Base Year Dollars)"}
                    wire={sInitialCost$}
                    value$={initialCost$}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.AMOUNT_FINANCED}
                    addonBefore={"$"}
                    controls
                    allowEmpty
                    label={"Amount Financed"}
                    wire={sAmountFinanced$}
                    value$={amountFinanced$}
                />

                <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                    <NumberInput
                        className={"w-full"}
                        info={Strings.EXPECTED_LIFETIME}
                        addonAfter={"years"}
                        controls
                        allowEmpty
                        label={"Expected Lifetime"}
                        wire={sExpectedLifetime$}
                        value$={expectedLifetime$}
                    />
                    <NumberInput
                        className={"w-full"}
                        info={Strings.ANNUAL_RATE_OF_CHANGE}
                        addonAfter={"%"}
                        controls
                        allowEmpty
                        label={"Annual Rate of Change"}
                        wire={sAnnualRateOfChange$}
                        value$={annualRateOfChange$}
                    />
                    <NumberInput
                        className={"w-full"}
                        info={Strings.COST_ADJUSTMENT_FACTOR}
                        addonAfter={"%"}
                        controls
                        allowEmpty
                        label={"Cost Adjustment Factor"}
                        wire={sCostAdjustmentFactor$}
                        value$={costAdjustmentFactor$}
                    />
                </div>

                {/*<PhaseIn /> // TODO replace with new grids
                <EscalationRate />*/}
            </div>

            <ResidualValue />
        </div>
    );
}
